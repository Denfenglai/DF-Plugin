import fetch from "node-fetch"
import moment from "moment"
import common from "../../../lib/common/common.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { Config, Plugin_Path } from "../components/index.js"

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
    const { GithubList, GiteeList, GithubToken, GiteeToken } = Config.CodeUpdate
    const content = await this.fetchUpdates(GithubList, "GitHub", GithubToken, "DF:CodeUpdate:GitHub", isAuto)
    content.push(...await this.fetchUpdates(GiteeList, "Gitee", GiteeToken, "DF:CodeUpdate:Gitee", isAuto))

    if (content.length > 0) {
      const base64 = await this.generateScreenshot(content, isAuto ? "Gayhub" : e.user_id)
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
    for (const repo of repoList) {
      try {
        logger.mark(`请求${source}：${repo}`)
        const data = await this.getRepositoryData(repo, source, token)
        if (!data[0]?.commit) {
          logger.error(`请求异常：${(data?.message === "Not Found Projec" || data?.message === "Not Found") ? "未找到对应仓库" : data?.message}`)
          continue
        }

        const time = moment(data[0].commit.author.date).format("YYYY-MM-DD HH:mm:ss")
        const sha = data[0].sha

        if (isAuto) {
          const redisData = await redis.get(`${redisKeyPrefix}:${repo}`)
          if (redisData && JSON.parse(redisData)[0].shacode === sha) {
            logger.mark(`${repo}暂无更新`)
            continue
          }
          redis.set(`${redisKeyPrefix}:${repo}`, JSON.stringify([ { shacode: sha } ]))
        }

        content.push({ name: `${source}: ${repo}`, time, text: data[0].commit.message })
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
   * @returns {Promise<object[]>} 提交数据或空数组
   */
  async getRepositoryData(repo, source, token) {
    let url, headers
    if (source === "GitHub") {
      url = `https://api.github.com/repos/${repo}/commits?per_page=1`
      headers = this.getHeaders(token, "GitHub")
    } else {
      url = `https://gitee.com/api/v5/repos/${repo}/commits?per_page=1`
      if (token) url += `&access_token=${token}`
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
   * @returns {Promise<object | null>} 返回请求的数据或null（请求失败）
   */
  async fetchData(url, headers) {
    try {
      const response = await fetch(url, { method: "get", headers })
      return await response.json()
    } catch (error) {
      logger.error(`访问失败: ${url}\n${error}`)
      return null
    }
  }

  /**
   * 生成截图
   * @param {object} content - 内容
   * @param {string} saveId - 保存ID
   * @returns {Promise<string>} 返回生成的截图的base64编码
   */
  async generateScreenshot(content, saveId) {
    return await puppeteer.screenshot("CodeUpdate", {
      tplFile: `${Plugin_Path}/resources/CodeUpdate/CodeUpdate.html`,
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
    let { Group } = Config.CodeUpdate
    if (!isAuto) return e.reply(data)
    if (!Array.isArray(Group)) {
      Group = [ Group ]
    }
    for (const group of Group) {
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
}
