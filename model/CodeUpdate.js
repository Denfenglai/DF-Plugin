import fetch from "node-fetch"
import moment from "moment"
import common from "../../../lib/common/common.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { PluginPath } from "./index.js"
import { Config, Res_Path } from "#components"
import { marked } from "marked"

export default new class CodeUpdate {
  /**
   * 检查仓库更新并发送通知
   * @param {boolean} isAuto - 是否为自动检查
   * @param {object} [e] - 消息事件对象
   */
  async checkUpdates(isAuto = false, e = null) {
    const {
      GithubList = [],
      GiteeList = [],
      GiteeReleases = [],
      GithubReleases = [],
      GithubToken,
      GiteeToken,
      AutoPath
    } = Config.CodeUpdate

    const githubRepos = AutoPath ? [ ...new Set([ ...GithubList, ...PluginPath.github ]) ] : GithubList
    const giteeRepos = AutoPath ? [ ...new Set([ ...GiteeList, ...PluginPath.gitee ]) ] : GiteeList

    logger.mark("开始检查仓库更新")

    const results = await Promise.all([
      this.fetchUpdates(githubRepos, "GitHub", GithubToken, "commits", "DF:CodeUpdate:GitHub", isAuto),
      this.fetchUpdates(giteeRepos, "Gitee", GiteeToken, "commits", "DF:CodeUpdate:Gitee", isAuto),
      this.fetchUpdates(GiteeReleases, "Gitee", GiteeToken, "releases", "DF:CodeUpdate:Release:Gitee", isAuto),
      this.fetchUpdates(GithubReleases, "GitHub", GithubToken, "releases", "DF:CodeUpdate:Release:GitHub", isAuto)
    ])

    const content = results.flat()

    if (content.length > 0) {
      logger.mark(`共检测到 ${content.length} 个更新`)

      const userId = isAuto ? "Auto" : e.user_id
      const base64 = await this.generateScreenshot(content, userId)
      await this.sendMessageToUser(base64, content, isAuto, e)
    } else {
      logger.mark("未检测到更新")
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
      if (!repo || Config.CodeUpdate.Exclude.includes(repo)) return

      try {
        logger.debug(`请求 ${source} ${type}: ${repo}`)

        const [ path, branch ] = type === "commits" ? repo.split(":") : [ repo ]
        let data = await this.getRepositoryData(path, source, type, token, branch)
        if (!data || [ "Not Found Projec", "Not Found" ].includes(data?.message)) {
          logger.error(`${source}: ${repo} 仓库不存在`)
          return
        }

        if (type === "commits" && branch) data = [ data ]
        if (data.length === 0 || (type === "releases" && !data[0]?.tag_name)) {
          logger.warn(`${source}: ${repo} 数据为空`)
          return
        }

        if (isAuto) {
          const id = type === "commits" ? data[0]?.sha : data[0]?.node_id
          if (await this.isUpToDate(repo, redisKeyPrefix, id)) {
            logger.debug(`${repo} 暂无更新`)
            return
          }
          logger.mark(`${repo} 检测到更新`)
          await this.updateRedis(repo, redisKeyPrefix, id, isAuto)
        }

        const info =
          type === "commits"
            ? this.formatCommitInfo(data[0], source, path, branch)
            : this.formatReleaseInfo(data[0], source, repo)
        content.push(info)
      } catch (error) {
        logger.error(`[DF-Plugin] 获取 ${source} ${type} ${repo} 数据出错: ${error?.stack || error}`)
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
    const authorTime = `<span>${this.timeAgo(moment(commit.author.date))}</span>`
    const committerTime = `<span>${this.timeAgo(moment(commit.committer.date))}</span>`
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
    const authorTime = `<span>${this.timeAgo(moment(published_at))}</span>`
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
   * 获取仓库的最新数据
   * @param {string} repo - 仓库路径（用户名/仓库名）
   * @param {string} source - 数据源（GitHub/Gitee）
   * @param {string} type - 请求类型（commits/releases）
   * @param {string} token - 访问Token
   * @param {string} sha - 提交起始的SHA值或者分支名. 默认: 仓库的默认分支
   * @returns {Promise<object[]>} 提交数据或空数组
   */
  async getRepositoryData(repo, source, type = "commits", token, sha) {
    const isGitHub = source === "GitHub"
    const baseURL = isGitHub ? "https://api.github.com/repos" : "https://gitee.com/api/v5/repos"
    const path = sha ? `${repo}/commits/${sha}` : `${repo}/${type}?per_page=1`
    let url = `${baseURL}/${path}`

    if (!isGitHub && token) {
      url += `${sha ? "?" : "&"}access_token=${token}`
    }

    const headers = this.getHeaders(token, source)
    const data = await this.fetchData(url, headers, repo, source)
    return data
  }

  /**
   * 获取请求头
   * @param {string} token - 访问Token
   * @param {string} source - 数据源（GitHub/Gitee）
   * @returns {object} 请求头
   */
  getHeaders(token, source) {
    const headers = {
      "User-Agent": "request",
      "Accept": source === "GitHub" ? "application/vnd.github+json" : "application/vnd.gitee+json"
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  /**
   * 获取指定 URL 的 JSON 数据
   * @param {string} url - 请求的 URL
   * @param {object} [headers] - 请求头
   * @param {string} repo - 仓库路径
   * @param {string} source - 数据源
   * @returns {Promise<object | false>} 返回请求的数据或 false（请求失败）
   */
  async fetchData(url, headers = {}, repo, source) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers
      })

      if (!response.ok) {
        let msg
        switch (response.status) {
          case 401:
            msg = "访问令牌无效或已过期"
            break
          case 403:
            msg = "请求达到Api速率限制，请尝试填写token或稍后再试"
            break
          case 404:
            msg = "仓库不存在"
            break
          default:
            msg = `状态码：${response.status}`
            break
        }

        logger.error(`请求${source}失败: ${repo}, ${msg}`)
        return false
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        logger.error(`响应非 JSON 格式: ${url} , 内容：${await response.text()}`)
        return false
      }

      return await response.json()
    } catch (error) {
      logger.error(`请求失败: ${url}，错误信息: ${error.stack}`)
      return false
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
   * @param {boolean} isAuto - 是否自动
   * @param {object} e - 消息事件
   */
  async sendMessageToUser(data, content, isAuto, e) {
    let { Group, QQ } = Config.CodeUpdate
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

  /**
   * 处理时间
   * @param {string} date 时间戳
   * @returns {string} 多久前
   */
  timeAgo(date) {
    const now = moment()
    const duration = moment.duration(now.diff(date))
    const years = duration.years()
    const months = duration.months()
    const days = duration.days()
    const hours = duration.hours()
    const minutes = duration.minutes()

    if (years >= 2) {
      return "两年以前"
    } else if (years >= 1) {
      return "1年前"
    } else if (months >= 1) {
      return `${months}个月前`
    } else if (days >= 1) {
      return `${days}天前`
    } else if (hours >= 1) {
      return `${hours}小时前`
    } else if (minutes >= 1) {
      return `${minutes}分钟前`
    } else {
      return "刚刚"
    }
  }
}()
