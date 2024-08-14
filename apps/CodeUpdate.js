import fetch from "node-fetch"
import moment from "moment"
import common from "../../../lib/common/common.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { Config, Plugin_Path } from "../components/index.js"

export class GIT_UPDATE extends plugin {
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
    let content = []
    for (let key of GithubList) {
      try {
        let data
        logger.mark("请求Github："+key)
        if (!GithubToken) {
          data = await this.getGitHubData(key)
        } else {
          data = await this.getGitHubDataByToken(key, GithubToken)
        }

        if (!data) continue

        let source = "GitHub: "
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        if (JSON.stringify(data).includes("API rate limit exceeded")) {
          content.push({ name: `${source}${key}`, time, text: "请求超出速率限制，请稍后再试，或者添加访问token" })
        } else {
          if (data === false || data.message === "Not Found") {
            content.push({name: `${source}${key}`, time, text: "未找到仓库，请核实仓库信息"})
          } else {
            let {sha} = data[0]
            time = moment(data[0].commit.author.date).format("YYYY-MM-DD HH:mm:ss")
            if (isAuto) {
              let redisdata = await redis.get(`DF:CodeUpdate:GitHub:${key}`)
              if (redisdata && JSON.parse(redisdata)[0].shacode === sha) {
                logger.mark(`${key}暂无更新`)
                continue
              }
              redis.set(`DF:CodeUpdate:GitHub:${key}`, JSON.stringify([{shacode: sha}]))
            }

            content.push({name: `${source}${key}`, time, text: data[0].commit.message})
          }
        }
        await common.sleep(3000)
      } catch (error) {
        logger.error(`[DF-Plugin]获取 ${key} 数据出错: ${error}`)
      }
    }
    for (let key of GiteeList) {
      try {
        let data
        logger.mark("请求Gitee："+key)
        if (!GiteeToken) {
          data = await this.getGiteeData(key)
        } else {
          data = await this.getGiteeDataByToken(key,GiteeToken)
        }
        if (!data) continue

        let source = "Gitee: "
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        if (JSON.stringify(data).includes("403 Forbidden (Rate Limit Exceeded)")) {
          content.push({ name: `${source}${key}`, time, text: "请求超出速率限制，请稍后再试，或者添加访问token" })
        } else {
          if (data === false || data.message === "Not Found Project") {
            content.push({name: `${source}${key}`, time, text: "未找到仓库，请核实仓库信息"})
          } else {

            let {sha} = data[0]
            time = moment(data[0].commit.author.date).format("YYYY-MM-DD HH:mm:ss")
            if (isAuto) {
              let redisdata = await redis.get(`DF:CodeUpdate:Gitee:${key}`)
              if (redisdata && JSON.parse(redisdata)[0].shacode === sha) {
                logger.mark(`${key}暂无更新`)
                continue
              }
              redis.set(`DF:CodeUpdate:Gitee:${key}`, JSON.stringify([{shacode: sha}]))
            }

            content.push({name: `${source}${key}`, time, text: data[0].commit.message})
          }
        }
        await common.sleep(3000)
      } catch (error) {
        logger.error(`[DF-Plugin]获取 ${key} 数据出错: ${error}`)
      }
    }

    if (content.length > 0) {
      let base64 = await this.generateScreenshot(content, isAuto ? "Gayhub" : e.user_id)
      await this.sendMessageToGroups(base64, content, isAuto, e)
    } else {
      logger.mark("[DF-Plugin]未检测到仓库更新")
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
    } catch (error) {
      logger.error(`访问失败: ${url}\n${error}`)
      return false
    }
  }

  /**
   * 获取Git仓库更新数据（优先GitHub，其次Gitee）
   * @param {string} key - 仓库路径（用户名/仓库名）
   * @param {string} Token - github Token
   * @returns {Promise<object | null>} 返回提交数据或null（未找到）
   */
  async getPluginUpdateData(key,Token) {
    let data
    if (!Token) {
      data = await this.getGitHubData(key)
    } else {
      data = await this.getGitHubDataByToken(key,Token)
    }
    let Git = "Github"
    if (data === false || data.message === "Not Found" || JSON.stringify(data).includes("API rate limit")) {
      data = await this.getGiteeData(key)
      Git = "Gitee"
      if (data === false || data.message === "Not Found Project") {
        return null
      }
    }
    return { ...data, GitName: Git }
  }

  /**
   * 获取GitHub库的最新提交数据
   * @param {string} key - GitHub仓库路径（用户名/仓库名）
   * @returns {Promise<object | boolean>} 返回提交数据或false（请求失败）
   */
  async getGitHubData(key) {
    const url = `https://api.github.com/repos/${key}/commits?per_page=1`
    const headers = {
      "User-Agent": "request",
      "Accept": "application/vnd.github+json"
    }
    return await this.fetchData(url, headers)
  }

  /**
   * 获取GitHub库的最新提交数据
   * @param {string} key - GitHub仓库路径（用户名/仓库名）
   * @param {string} Token - github Token
   * @returns {Promise<object | boolean>} 返回提交数据或false（请求失败）
   */
  async getGitHubDataByToken(key,Token) {
    const url = `https://api.github.com/repos/${key}/commits?per_page=1`
    const headers = {
      "User-Agent": "request",
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${Token}`
    }
    return await this.fetchData(url, headers)
  }

  /**
   * 获取Gitee库的最新提交数据
   * @param {string} key - Gitee仓库路径（用户名/仓库名）
   * @returns {Promise<object | boolean>} 返回提交数据或false（请求失败）
   */
  async getGiteeData(key) {
    const url = `https://gitee.com/api/v5/repos/${key}/commits?per_page=1`
    const headers = {
      "User-Agent": "request",
      "Accept": "application/vnd.gitee+json"
    }
    return await this.fetchData(url, headers)
  }

  /**
   * 获取Gitee库的最新提交数据
   * @param {string} key - Gitee仓库路径（用户名/仓库名）
   * @param {string} Token - Gitee Token
   * @returns {Promise<object | boolean>} 返回提交数据或false（请求失败）
   */
  async getGiteeDataByToken(key,Token) {
    const url = `https://gitee.com/api/v5/repos/${key}/commits?per_page=1&access_token=${Token}`
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
   * @param {boolean} isAuto - 是否自动
   * @param {object} e - 消息事件
   */
  async sendMessageToGroups(data, content, isAuto, e) {
    const { Gruop } = Config.CodeUpdate
    if (!isAuto) return e.reply(data)
    for (let key of Gruop) {
      if (content.length !== 0 && data) {
        Bot.pickGroup(key).sendMsg(data)
      }
      await common.sleep(5000)
    }
  }
}
