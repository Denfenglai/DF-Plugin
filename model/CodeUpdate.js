import moment from "moment"
import common from "../../../lib/common/common.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { GitApi } from "./api/index.js"
import { PluginPath } from "#model"
import { Config, Res_Path, common as Common } from "#components"
import { marked } from "marked"

const key = "DF:CodeUpdate"

export default new class CodeUpdate {
  /**
   * 检查仓库更新并发送通知
   * @param {boolean} isAuto - 是否为自动检查
   * @param {object} e - 消息事件对象
   */
  async checkUpdates(isAuto = false, e) {
    const {
      GithubToken = "",
      GiteeToken = "",
      List = []
    } = Config.CodeUpdate

    if (!List.length) {
      logger.mark("[DF-Plugin][CodeUpdate]没有配置仓库信息，取消检查更新")
      return isAuto ? false : e.reply("还没有配置仓库信息呢")
    }

    logger.mark(logger.blue("开始检查仓库更新"))

    let number = 0
    for (const list of List) {
      const {
        GithubList = [],
        GiteeList = [],
        GiteeReleases = [],
        GithubReleases = [],
        AutoPath = false,
        Exclude = [],
        Group = [],
        QQ = []
      } = list

      const githubRepos = AutoPath ? [ ...new Set([ ...GithubList, ...PluginPath.github ]) ].filter(path => !Exclude.includes(path)) : GithubList
      const giteeRepos = AutoPath ? [ ...new Set([ ...GiteeList, ...PluginPath.gitee ]) ].filter(path => !Exclude.includes(path)) : GiteeList

      const promises = []
      if (githubRepos?.length > 0) promises.push(this.fetchUpdates(githubRepos, "GitHub", GithubToken, "commits", `${key}:GitHub`, isAuto))
      if (giteeRepos?.length > 0) promises.push(this.fetchUpdates(giteeRepos, "Gitee", GiteeToken, "commits", `${key}:Gitee`, isAuto))
      if (GiteeReleases?.length > 0) promises.push(this.fetchUpdates(GiteeReleases, "Gitee", GiteeToken, "releases", `${key}:GiteeReleases`, isAuto))
      if (GithubReleases?.length > 0) promises.push(this.fetchUpdates(GithubReleases, "GitHub", GithubToken, "releases", `${key}:GithubReleases`, isAuto))

      const results = await Promise.all(promises)

      const content = results.flat()

      if (content.length > 0) {
        number += content.length
        const userId = isAuto ? "Auto" : e.user_id;
        (async() => {
          const base64 = await this.generateScreenshot(content, userId)
          this.sendMessageToUser(base64, content, Group, QQ, isAuto, e)
        })()
      }
    }
    if (number > 0) {
      logger.info(logger.green(`ヾ(≧▽≦*)o 本次共获取到${number}条数据~`))
    } else {
      logger.info(logger.yellow("＞︿＜ 本次没有获取到任何数据~"))
    }
  }

  /**
   * 通用更新检查函数
   * @param {string[]} repoList - 仓库列表
   * @param {string} source - 数据源（GitHub/Gitee）
   * @param {string} token - 访问Token
   * @param {string} type - 数据类型（commits/releases）
   * @param {string} redisKeyPrefix - Redis前缀
   * @param {boolean} isAuto - 是否为自动检查
   * @returns {Promise<object[]>} 更新内容数组
   */
  async fetchUpdates(repoList, source, token, type, redisKeyPrefix, isAuto) {
    const content = []

    await Promise.all(repoList.map(async(repo) => {
      if (!repo) return

      try {
        logger.debug(`请求 ${logger.magenta(source)} ${type}: ${logger.cyan(repo)}`)

        const [ path, branch ] = type === "commits" ? repo.split(":") : [ repo ]
        let data = await GitApi.getRepositoryData(path, source, type, token, branch)
        if (!data) return
        if ([ "Not Found Projec", "Not Found" ].includes(data?.message)) {
          logger.error(`${logger.magenta(source)}: ${logger.cyan(repo)} 仓库不存在`)
          return
        }

        if (type === "commits" && branch) data = [ data ]
        if (data.length === 0 || (type === "releases" && !data[0]?.tag_name)) {
          logger.warn(`${logger.magenta(source)}: ${logger.cyan(repo)} 数据为空`)
          return
        }

        if (isAuto) {
          const id = type === "commits" ? data[0]?.sha : data[0]?.node_id
          if (await this.isUpToDate(repo, redisKeyPrefix, id)) {
            logger.debug(`${logger.cyan(repo)} 暂无更新`)
            return
          }
          logger.mark(`${logger.cyan(repo)} 检测到更新`)
          await this.updateRedis(repo, redisKeyPrefix, id, isAuto)
        }

        const info =
          type === "commits"
            ? this.formatCommitInfo(data[0], source, path, branch)
            : this.formatReleaseInfo(data[0], source, repo)
        content.push(info)
      } catch (error) {
        logger.error(`[DF-Plugin] 获取 ${logger.magenta(source)} ${type} ${logger.cyan(repo)} 数据出错: ${error?.stack || error}`)
      }
    }))

    return content
  }

  /**
   * 检查仓库是否已更新
   * @param {string} repo - 仓库名
   * @param {string} redisKeyPrefix - Redis前缀
   * @param {string} sha - 当前的提交SHA
   * @returns {Promise<boolean>} 是否为最新
   */
  async isUpToDate(repo, redisKeyPrefix, sha) {
    const redisData = await redis.get(`${redisKeyPrefix}:${repo}`)
    return redisData && JSON.parse(redisData)[0].shacode === sha
  }

  /**
   * 更新 Redis 记录
   * @param {string} repo - 仓库名
   * @param {string} redisKeyPrefix - Redis前缀
   * @param {string} sha - 当前的提交SHA
   * @param {boolean} isAuto - 是否自动检查
   */
  async updateRedis(repo, redisKeyPrefix, sha, isAuto) {
    if (isAuto) {
      await redis.set(`${redisKeyPrefix}:${repo}`, JSON.stringify([ { shacode: sha } ]))
    }
  }

  /**
   * 格式化提交信息
   * @param {object} data - 仓库数据
   * @param {string} source - 数据源
   * @param {string} repo - 仓库名
   * @param {string} branch - 分支名
   * @returns {object} 格式化后的提交信息
   */
  formatCommitInfo(data, source, repo, branch) {
    const { author, committer, commit, stats, files } = data
    const authorName = `<span>${commit.author.name}</span>`
    const committerName = `<span>${commit.committer.name}</span>`
    const authorTime = `<span>${Common.timeAgo(moment(commit.author.date))}</span>`
    const committerTime = `<span>${Common.timeAgo(moment(commit.committer.date))}</span>`
    const timeInfo = authorName === committerName
      ? `${authorName} 提交于 ${authorTime}`
      : `${authorName} 编写于 ${authorTime}，并由 ${committerName} 提交于 ${committerTime}`

    return {
      avatar: {
        is: author?.avatar_url !== committer?.avatar_url,
        author: author?.avatar_url,
        committer: committer?.avatar_url
      },
      name: {
        source,
        repo,
        branch,
        authorStart: commit.author.name?.[0] ?? "?",
        committerStart: commit.committer.name?.[0] ?? "?"
      },
      time_info: timeInfo,
      text: this.formatMessage(commit.message),
      stats: stats && files ? { files: files.length, additions: stats.additions, deletions: stats.deletions } : false
    }
  }

  /**
   * 格式化提交信息的消息部分
   * @param {string} message - 提交信息
   * @returns {string} 格式化后的消息
   */
  formatMessage(message) {
    const msgMap = message.split("\n")
    msgMap[0] = "<span class='head'>" + msgMap[0] + "</span>"
    return msgMap.join("\n")
  }

  /**
   * 格式化发行版信息
   * @param {object} data - 发行版数据
   * @param {string} source - 数据源
   * @param {string} repo - 仓库名
   * @returns {object} 格式化后的发行版信息
   */
  formatReleaseInfo(data, source, repo) {
    const { tag_name, name, body, author, published_at } = data
    const authorName = `<span>${author?.login || author?.name}</span>`
    const authorAvatar = author?.avatar_url
    const authorTime = `<span>${Common.timeAgo(moment(published_at))}</span>`
    const timeInfo = authorName ? `${authorName} 发布于 ${authorTime}` : `${authorTime}`

    return {
      release: true,
      avatar: authorAvatar,
      name: {
        source,
        repo,
        tag: tag_name,
        authorStart: author?.login?.[0] || author?.name?.[0] || "?"
      },
      time_info: timeInfo,
      text: "<span class='head'>" + name + "</span>\n" + marked(body)
    }
  }

  /**
   * 生成截图
   * @param {object} content - 内容
   * @param {string} saveId - 保存ID
   * @returns {Promise<string>} 返回生成的截图的base64编码
   */
  async generateScreenshot(content, saveId) {
    return await puppeteer.screenshot("CodeUpdate/index", {
      tplFile: `${Res_Path}/CodeUpdate/index.html`,
      saveId,
      lifeData: content,
      pluResPath: `${Res_Path}/`
    })
  }

  /**
   * 推送更新内容
   * @param {string} data - 要发送的截图的base64编码
   * @param {object[]} content - 消息内容
   * @param {Array} Group - 要发送的群号
   * @param {Array} QQ - 要发送的QQ号
   * @param {boolean} isAuto - 是否自动
   * @param {object} e - 消息事件
   */
  async sendMessageToUser(data, content, Group, QQ, isAuto, e) {
    if (!isAuto) return e.reply(data)
    for (const group of Group) {
      if (content.length > 0 && data) {
        Bot.pickGroup(group).sendMsg(data)
      }
      await common.sleep(5000)
    }
    for (const qq of QQ) {
      if (content.length > 0 && data) {
        Bot.pickFriend(qq).sendMsg(data)
      }
      await common.sleep(5000)
    }
  }
}()
