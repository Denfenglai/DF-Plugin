import fetch from "node-fetch"
import moment from "moment"
import common from "../../../lib/common/common.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { Config } from "../components/index.js"

const Plugin_Path = `${process.cwd()}/plugins/DF-Plugin`

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
    this.task = {
      cron: Config.CodeUpdate.Cron,
      name: "[DF-Plugin]定时检查指定Git库是否更新",
      fnc: () => this.cupdateauto()
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
    if (!Config.CodeUpdate.Auto) return false
    await this.checkUpdates(true)
  }

  /**
   * 检查更新并发送通知
   * @param {boolean} isAuto - 是否为自动检查
   * @param {object} [e] - 消息事件对象
   */
  async checkUpdates(isAuto = false, e = null) {
    const { GitList } = Config.CodeUpdate
    let content = []
    for (let key of GitList) {
      let title = key.split("/").pop()
      let data = await this.getPluginUpdateData(key, title)
      if (!data) continue

      let time = moment(data[0].commit.author.date).format("YYYY-MM-DD HH:mm:ss")
      let sha = data[0].sha
      let is_wm = data.message !== "Not Found" ? "Github：" : "Gitee："

      if (isAuto) {
        let redisdata = await redis.get(`DF:CodeUpdate:${title}`)
        if (redisdata && JSON.parse(redisdata)[0].shacode === sha) {
          Bot.logger.mark(`${title}暂无更新`)
          continue
        }
        redis.set(`DF:CodeUpdate:${title}`, JSON.stringify([ { shacode: sha } ]))
      }

      content.push({ "name": `${is_wm}${title}`, time, "text": data[0].commit.message })
      await common.sleep(3000)
    }

    if (content.length > 0) {
      let base64 = await this.generateScreenshot(content, isAuto ? "Gayhub" : e.user_id)
      await this.sendMessageToGroups(base64, content)
    } else {
      Bot.logger.mark("未检测到仓库更新")
    }
  }

  /**
   * 获取指定URL的JSON数据
   * @param {string} url - 请求的URL
   * @param {object} headers - 请求头
   * @returns {Promise<object | boolean>} 返回请求的数据或false（请求失败）
   */
  async fetchData(url, headers) {
    try {
      let response = await fetch(url, { method: "get", headers })
      let data = await response.json()
      return data
    } catch (e) {
      console.error(`访问失败: ${url}`, e)
      return false
    }
  }

  /**
   * 获取Git仓库更新数据（优先GitHub，其次Gitee）
   * @param {string} key - 仓库路径（用户名/仓库名）
   * @param {string} title - 仓库名称
   * @returns {Promise<object | null>} 返回提交数据或null（未找到）
   */
  async getPluginUpdateData(key, title) {
    let data = await this.getGitHubData(key, title)
    if (data === false || data.message === "Not Found") {
      data = await this.getGiteeData(key, title)
      if (data === false || data.message === "Not Found Project") {
        return null
      }
    }
    return data
  }

  /**
   * 获取GitHub库的最新提交数据
   * @param {string} key - GitHub仓库路径（用户名/仓库名）
   * @param {string} title - 仓库名称
   * @returns {Promise<object | boolean>} 返回提交数据或false（请求失败）
   */
  async getGitHubData(key, title) {
    const url = `https://api.github.com/repos/${key}/commits?per_page=1`
    const headers = {
      "User-Agent": "request",
      "Accept": "application/vnd.github+json"
    }
    return await this.fetchData(url, headers)
  }

  /**
   * 获取Gitee库的最新提交数据
   * @param {string} key - Gitee仓库路径（用户名/仓库名）
   * @param {string} title - 仓库名称
   * @returns {Promise<object | boolean>} 返回提交数据或false（请求失败）
   */
  async getGiteeData(key, title) {
    const url = `https://gitee.com/api/v5/repos/${key}/commits?per_page=1`
    const headers = {
      "User-Agent": "request",
      "Accept": "application/vnd.gitee+json"
    }
    return await this.fetchData(url, headers)
  }

  /**
   * 生成截图
   * @param {object} content
   * @param {string} saveId
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
   */
  async sendMessageToGroups(data, content) {
    const { Gruop } = Config.CodeUpdate
    for (let key of Gruop) {
      if (content.length !== 0 && data) {
        Bot.pickGroup(key).sendMsg(data)
      }
      await common.sleep(5000)
    }
  }
}
