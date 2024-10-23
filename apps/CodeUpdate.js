import fetch from "node-fetch"
import moment from "moment"
import common from "../../../lib/common/common.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { Config, Plugin_Path } from "../components/index.js"
import { PluginDirs } from "../model/index.js"

const PluginPath = await PluginDirs()

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
    const content = [
      ...await this.fetchUpdates(GithubList, "GitHub", GithubToken, "DF:CodeUpdate:GitHub", isAuto),
      ...await this.fetchUpdates(GiteeList, "Gitee", GiteeToken, "DF:CodeUpdate:Gitee", isAuto)
    ]

    if (content.length > 0) {
      logger.mark(`共检测到${content.length}个仓库更新`)
      const base64 = await this.generateScreenshot(content, isAuto ? "Auto" : e.user_id)
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
    for (let repo of repoList) {
      try {
        logger.debug(`请求${source}:${repo}`)
        let _repo = repo.split(":")
        let branch = _repo[1]
        repo = _repo[0]
        let data = await this.getRepositoryData(repo, source, token, branch)
        if (!data) continue
        if (branch) data = [ data ]
        if (!data[0]?.commit) {
          logger.error(`请求异常：${(data?.message === "Not Found Projec" || data?.message === "Not Found") ? "未找到对应仓库" : (data?.message ? data.message : data)}`)
          continue
        }
        const { author, committer, commit, sha, stats, files } = data[0]
        const authorTime = "<span>" + this.timeAgo(moment(commit.author.date)) + "</span>"
        const committerTime = "<span>" + this.timeAgo(moment(commit.committer.date)) + "</span>"
        const author_name = "<span>" + commit.author.name + "</span>"
        const committer_name = "<span>" + commit.committer.name + "</span>"
        const time_info = author_name === committer_name ? `${author_name} 提交于 ${authorTime}` : `${author_name} 编写于 ${authorTime}，并由 ${committer_name} 提交于 ${committerTime}`

        if (isAuto) {
          const redisData = await redis.get(`${redisKeyPrefix}:${repo}`)
          if (redisData && JSON.parse(redisData)[0].shacode === sha) {
            logger.debug(`${repo} 暂无更新`)
            continue
          }
          logger.mark(`${repo} 检测到更新`)
          redis.set(`${redisKeyPrefix}:${repo}`, JSON.stringify([ { shacode: sha } ]))
          if (!redisData) continue
        }
        /**
         * 处理消息
         * @param {string} msg
         */
        function handleMsg(msg) {
          const msgMap = msg.split("\n")
          msgMap[0] = "<span class='head'>" + msgMap[0] + "</span>"
          return msgMap.join("\n")
        }

        const avatar = {
          is: author?.avatar_url != committer?.avatar_url,
          author: author?.avatar_url,
          committer: committer?.avatar_url
        }
        const name = {
          source,
          repo,
          branch,
          authorStart: commit.author.name?.[0] ?? "?",
          committerStart: commit.committer.name?.[0] ?? "?"
        }
        let _stats = false
        if (stats && files) {
          _stats = {
            files: files.length,
            additions: stats.additions,
            deletions: stats.deletions
          }
        }
        if (!author) {
          avatar.is = false
          avatar.author = committer?.avatar_url
          name.authorStart = name.committerStart
        }
        content.push({
          avatar,
          name,
          time_info,
          text: handleMsg(commit.message),
          stats: _stats
        })
        await common.sleep(3000)
      } catch (error) {
        this.logError(repo, source, error)
      }
    }
    return content
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
    let url, headers, path
    if (sha) {
      path = `${repo}/commits/${sha}`
    } else {
      path = `${repo}/commits?per_page=1`
    }
    if (source === "GitHub") {
      url = `https://api.github.com/repos/${path}`
      headers = this.getHeaders(token, "GitHub")
    } else {
      url = `https://gitee.com/api/v5/repos/${path}`
      if (token) url += `${sha ? "?" : "&"}access_token=${token}`
      headers = this.getHeaders(token, "Gitee")
    }

    return await this.fetchData(url, headers)
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
   * 获取指定URL的JSON数据
   * @param {string} url - 请求的URL
   * @param {object} headers - 请求头
   * @returns {Promise<object | false>} 返回请求的数据或false（请求失败）
   */
  async fetchData(url, headers) {
    try {
      const response = await fetch(url, { method: "get", headers })
      return await response.json()
    } catch (error) {
      logger.error(`请求失败: ${url}：${error}`)
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
   * 记录错误日志
   * @param {string} repo - 仓库路径
   * @param {string} source - 数据源（GitHub/Gitee）
   * @param {Error} error - 错误对象
   */
  logError(repo, source, error) {
    logger.error(`[DF-Plugin]获取 ${source} 仓库 ${repo} 数据出错: ${error}`)
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
