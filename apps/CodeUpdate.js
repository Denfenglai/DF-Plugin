import fetch from "node-fetch"
import moment from "moment"
import common from "../../../lib/common/common.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { Config, Plugin_Path } from "../components/index.js"
import { PluginPath } from "../model/index.js"

export class CodeUpdate extends plugin {
  constructor() {
    super({
      name: "DF:仓库更新推送",
      dsc: "检查指定Git仓库是否更新并推送",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: "^#检查仓库更新$",
          fnc: "cupdate"
        }
      ]
    })

    if (Config.CodeUpdate.Auto) {
      this.task = {
        cron: Config.CodeUpdate.Cron,
        name: "[DF-Plugin]Git仓库更新检查",
        fnc: () => this.cupdateauto()
      }
    }
  }

  /**
   * 手动检查更新
   * @param {object} e - 消息事件对象
   */
  async cupdate(e) {
    await this.checkUpdates(false, e)
  }

  /**
   * 自动检查更新
   */
  async cupdateauto() {
    await this.checkUpdates(true)
  }

  /**
   * 检查更新并发送通知
   * @param {boolean} isAuto - 是否为自动检查
   * @param {object} [e] - 消息事件对象
   */
  async checkUpdates(isAuto = false, e = null) {
    let { GithubList, GiteeList, GithubToken, GiteeToken, AutoPath } = Config.CodeUpdate

    if (AutoPath) {
      GithubList = [ ...new Set([ ...GithubList, ...PluginPath.github ]) ]
      GiteeList = [ ...new Set([ ...GiteeList, ...PluginPath.gitee ]) ]
    }

    logger.mark("开始检查仓库更新")

    const [ githubUpdates, giteeUpdates ] = await Promise.all([
      this.fetchUpdates(GithubList, "GitHub", GithubToken, "DF:CodeUpdate:GitHub", isAuto),
      this.fetchUpdates(GiteeList, "Gitee", GiteeToken, "DF:CodeUpdate:Gitee", isAuto)
    ])

    const content = [ ...githubUpdates, ...giteeUpdates ]

    if (content.length > 0) {
      logger.mark(`共检测到 ${content.length} 个仓库更新`)

      const userId = isAuto ? "Auto" : e.user_id
      const base64 = await this.generateScreenshot(content, userId)
      await this.sendMessageToGroups(base64, content, isAuto, e)
    } else {
      logger.mark("[DF-Plugin]未检测到仓库更新")
    }
  }

  /**
   * 获取更新数据
   * @param {string[]} repoList - 仓库列表
   * @param {string} source - 数据源（GitHub/Gitee）
   * @param {string} token - 访问Token
   * @param {string} redisKeyPrefix - Redis前缀
   * @param {boolean} isAuto - 是否为自动检查
   * @returns {Promise<object[]>} 更新内容数组
   */
  async fetchUpdates(repoList, source, token, redisKeyPrefix, isAuto) {
    const content = []

    await Promise.all(repoList.map(async(repo) => {
      if (!repo || Config.CodeUpdate.Exclude.includes(repo)) return

      try {
        logger.debug(`请求 ${source}: ${repo}`)
        const [ path, branch ] = repo.split(":")
        let data = await this.getRepositoryData(path, source, token, branch)
        if (!data) return
        if (data?.message === "Not Found Projec" || data?.message === "Not Found") {
          logger.error(`${source}: ${repo} 仓库不存在`)
          return
        }
        if (branch) data = [ data ]
        if (!data[0]?.commit) {
          logger.error(`获取 ${source}: ${repo} 数据异常: ${data?.message || JSON.stringify(data)}`)
          return
        }

        if (isAuto) {
          const sha = data[0].sha
          if (await this.isUpToDate(repo, redisKeyPrefix, sha)) {
            logger.debug(`${repo} 暂无更新`)
            return
          }
          logger.mark(`${repo} 检测到更新`)
          await this.updateRedis(repo, redisKeyPrefix, sha, isAuto)
        }
        const commitInfo = this.formatCommitInfo(data[0], source, path, branch)
        content.push(commitInfo)
      } catch (error) {
        logger.error(`[DF-Plugin] 获取 ${source} 仓库 ${repo} 数据出错: ${error?.stack || error}`)
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
   * 获取仓库的最新提交数据
   * @param {string} repo - 仓库路径（用户名/仓库名）
   * @param {string} source - 数据源（GitHub/Gitee）
   * @param {string} token - 访问Token
   * @param {string} sha - 提交起始的SHA值或者分支名. 默认: 仓库的默认分支
   * @returns {Promise<object[]>} 提交数据或空数组
   */
  async getRepositoryData(repo, source, token, sha) {
    const isGitHub = source === "GitHub"
    const baseURL = isGitHub ? "https://api.github.com/repos" : "https://gitee.com/api/v5/repos"
    const path = sha ? `${repo}/commits/${sha}` : `${repo}/commits?per_page=1`
    let url = `${baseURL}/${path}`

    if (!isGitHub && token) {
      url += `${sha ? "?" : "&"}access_token=${token}`
    }

    const headers = this.getHeaders(token, source)
    const data = await this.fetchData(url, headers)
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
   * @returns {Promise<object | false>} 返回请求的数据或 false（请求失败）
   */
  async fetchData(url, headers = {}) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers
      })

      if (!response.ok) {
        logger.error(`请求失败: ${url}，状态码: ${response.status}`)
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
      tplFile: `${Plugin_Path}/resources/CodeUpdate/index.html`,
      saveId,
      lifeData: content,
      pluResPath: `${Plugin_Path}/resources/`
    })
  }

  /**
   * 向群聊推送更新内容
   * @param {string} data - 要发送的截图的base64编码
   * @param {object[]} content - 消息内容
   * @param {boolean} isAuto - 是否自动
   * @param {object} e - 消息事件
   */
  async sendMessageToGroups(data, content, isAuto, e) {
    let { Gruop } = Config.CodeUpdate
    if (!isAuto) return e.reply(data)
    if (!Array.isArray(Gruop) && Gruop) {
      Gruop = [ Gruop ]
    }
    for (const group of Gruop) {
      if (content.length > 0 && data) {
        Bot.pickGroup(group).sendMsg(data)
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
}
