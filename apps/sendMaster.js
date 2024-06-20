import _ from "lodash"
import cfg from "../../../lib/config/config.js"
import moment from "moment"
import { Config } from "../components/index.js"
import { sendMasterMsg } from "../model/index.js"

const key = "DF:contact"
let Sending = false

export class SendMasterMsgs extends plugin {
  constructor() {
    super({
      name: "DF:联系主人",
      dsc: "给主人发送一条消息",
      event: "message",
      priority: 400,
      rule: [
        {
          reg: "^#联系主人",
          fnc: "contact"
        },
        {
          reg: "^#?回复",
          fnc: "Replys",
          event: "message.private"
        }
      ]
    })
  }

  /**
   * 联系主人
   * @param e
   */
  async contact(e) {
    try {
      if (Sending) return e.reply("❎ 已有发送任务正在进行中，请稍候重试")
      let { open, cd, BotId, sendAvatar } = Config.sendMaster
      if (!open) return e.reply("❎ 该功能暂未开启，请先让主人开启才能用哦")
      if (await redis.get(key) && !e.isMaster) return e.reply("❎ 操作频繁，请稍后再试！")
      Sending = true
      /** 处理艾特 */
      e.message = e.message.filter(item => item.type !== "at")
      /** 处理消息 */
      for (let msgElement of e.message) {
        if (msgElement.type === "text") {
          msgElement.text = msgElement.text.replace("#联系主人", "").trim()
          if (e.isGroup) {
            let groupCfg = cfg.getGroup(e.self_id, e.group_id) || cfg.getGroup(e.group_id)
            let alias = groupCfg.botAlias
            if (!Array.isArray(alias)) {
              alias = [ alias ]
            }
            for (let name of alias) {
              if (msgElement.text.startsWith(name)) {
                msgElement.text = _.trimStart(msgElement.text, name).trim()
                e.hasAlias = true
                break
              }
            }
          }
        }
      }
      if (e.message.length === 0) return e.reply("❎ 消息不能为空")
      /** 获取触发时间 */
      const time = moment().format("YYYY-MM-DD HH:mm:ss")
      /** 处理发送者信息 */
      const img = e.member?.getAvatarUrl() || e.friend.getAvatarUrl()
      const id = `${e.sender.nickname}(${e.user_id})`
      const bot = `${e.bot.nickname}(${e.bot.uin})`
      const type = e.bot?.version?.id || e?.adapter_id || "QQ"
      const group = e.isGroup ? `${e.group.name}(${e.group_id})` : "私聊"
      /** 制作消息 */
      const msg = [
        `联系主人消息(${e.seq})\n`,
        sendAvatar ? segment.image(img) : "",
        `平台: ${type}\n`,
        `用户: ${id}\n`,
        `来自: ${group}\n`,
        `BOT: ${bot}\n`,
        `时间: ${time}\n`,
        "消息内容:\n"
      ]
      msg.push(...e.message)
      msg.push(
        "\n-------------\n",
        "引用该消息：#回复 <内容>"
      )
      const info = {
        bot: e.bot.uin,
        group: e.isGroup ? e.group_id : false,
        id: e.user_id,
        message_id: e.message_id
      }
      this.masterQQ = Config.sendMaster.Master !== 1 && Config.sendMaster.Master !== 0
        ? Config.sendMaster.Master
        : (Config.masterQQ[0] == "stdin"
            ? (Config.masterQQ[1] ? Config.masterQQ[1] : Config.masterQQ[0])
            : Config.masterQQ[0])
      if (BotId == 0) BotId = e.bot.uin
      /** 发送消息给主人，处理异常信息 */
      await sendMasterMsg(msg, BotId)
        .then(() => e.reply(`✅ 消息已送达\n主人的QQ：${this.masterQQ}`))
        .then(() => redis.set(key, "1", { EX: cd }))
        .then(() => redis.set(`${key}:${e.seq}`, JSON.stringify(info), { EX: 86400 }))
        .catch(err => {
          e.reply(`❎ 消息发送失败，请尝试自行联系：${this.masterQQ}\n错误信息：${err}`)
          logger.error(err)
        })
      Sending = false
    } catch (error) {
      e.reply("❎ 出错误辣，稍后重试吧")
      logger.error(error)
      Sending = false
    }
  }

  /**
   * 回复消息
   * @param e
   */
  async Replys(e) {
    if (!e.isMaster) return false

    let source
    if (e.getReply) {
      source = await e.getReply()
    } else if (e.source) {
      source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
    }

    if (!source) return false
    if (!(/联系主人消息/.test(source.raw_message))) return false

    const sourceMsg = source.raw_message.split("\n")[0]
    const regex = /\(([^)]+)\)/
    const match = sourceMsg.match(regex)
    if (!match) return false

    const MsgID = match[1]
    const data = await redis.get(`${key}:${MsgID}`)
    if (!data) return e.reply("消息太久远了，下次来早点吧~")

    const { bot, group, id, message_id } = JSON.parse(data)

    e.message[0].text = e.message[0].text.replace(/#?回复/g, "").trim()
    e.message.unshift(`主人(${e.user_id})回复：\n`)
    e.message.unshift(segment.reply(message_id))

    if (group) {
      Bot[bot].pickGroup(group).sendMsg(e.message)
    } else {
      Bot[bot].pickFriend(id).sendMsg(e.message)
    }

    return e.reply("✅ 消息已送达")
  }
}
