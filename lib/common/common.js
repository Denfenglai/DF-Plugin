import render from "../puppeteer/render.js"
import Config from "../../components/Config.js"

/**
 * 休眠函数
 * @param {number} ms - 毫秒
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 处理消息内容
 * @param {object} e - 消息事件
 * @param {RegExp} Reg - 正则表达式
 * @returns {object} message - 处理后的消息内容数组
 */
function Replace(e = this.e, Reg = null) {
  const message = e.message.filter((item) => item.type != "at")

  for (let msgElement of message) {
    if (msgElement.type === "text") {
      if (Reg) msgElement.text = msgElement.text.replace(Reg, "").trim()
      if (!msgElement.text) message.splice(message.indexOf(msgElement), 1)

      if (e.hasAlias && e.isGroup) {
        let groupCfg = Config.getGroup(e.group_id, e.self_id)
        let alias = groupCfg.botAlias

        if (!Array.isArray(alias)) alias = [ alias ]

        for (let name of alias) {
          if (msgElement.text.startsWith(name)) {
            msgElement.text = msgElement.text.slice(name.length).trim()
            break
          }
        }
      }
    } else if (msgElement.type === "image" && msgElement.url) msgElement.file = msgElement.url
  }
  return message
}

export default {
  render,
  sleep,
  Replace
}
