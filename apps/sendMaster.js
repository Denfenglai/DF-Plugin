import _ from "lodash"
import { ConfigController as cfg } from "yunzai/config"
import moment from "moment"
import { Config } from "../components/index.js"
import { sendMasterMsg } from "../model/index.js"

const key = "DF:contact"
let Sending = false

export class SendMasterMsgs extends plugin {
  constructor() {
    super()
    this.name = "DF:联系主人"
    this.dsc = "给主人发送一条消息"
    this.event = "message"
    this.priority = 400
    this.rule = [
      {
        reg: /^#联系主人/,
        fnc: this.contact.name
      },
      {
        reg: /^#?回复/,
        fnc: this.Replys.name,
        event: "message.private"
      }
    ]
  }

  /**
   * 联系主人
   */
  async contact() {
    try {
      if (Sending) {
        this.e.reply("❎ 已有发送任务正在进行中，请稍候重试")
        return
      }
      let { open, cd, BotId, sendAvatar } = Config.sendMaster
      if (!open) return this.e.reply("❎ 该功能暂未开启，请先让主人开启才能用哦")
      if (await redis.get(key) && !this.e.isMaster) return this.e.reply("❎ 操作频繁，请稍后再试！")

      Sending = true
      this.e.message = this.e.message.filter(item => item.type !== "at")
      for (let msgElement of this.e.message) {
        if (msgElement.type === "text") {
          msgElement.text = msgElement.text.replace("#联系主人", "").trim()
          if (this.e.isGroup) {
            let groupCfg = cfg.getGroup(this.e.self_id, this.e.group_id) || cfg.getGroup(this.e.group_id)
            let alias = groupCfg.botAlias
            if (!Array.isArray(alias)) {
              alias = [ alias ]
            }
            for (let name of alias) {
              if (msgElement.text.startsWith(name)) {
                msgElement.text = _.trimStart(msgElement.text, name).trim()
                this.e.hasAlias = true
                break
              }
            }
          }
        }
      }
      if (this.e.message.length === 0) {
        this.e.reply("❎ 消息不能为空")
        return
      }

      const type = this.e.bot?.version?.id || this.e?.adapter_id || "QQ"
      const img = this.e.member?.getAvatarUrl() || this.e.friend.getAvatarUrl()
      const id = `${this.e.sender.nickname}(${this.e.user_id})`
      const group = this.e.isGroup ? `${this.e.group.name}(${this.e.group_id})` : "私聊"
      const bot = `${this.e.bot.nickname}(${this.e.bot.uin})`
      const time = moment().format("YYYY-MM-DD HH:mm:ss")

      const msg = [
        `联系主人消息(${this.e.seq})\n`,
        sendAvatar ? segment.image(img) : "",
        `平台: ${type}\n`,
        `用户: ${id}\n`,
        `来自: ${group}\n`,
        `BOT: ${bot}\n`,
        `时间: ${time}\n`,
        "消息内容:\n"
      ]
      msg.push(...this.e.message)
      msg.push(
        "\n-------------\n",
        "引用该消息：#回复 <内容>"
      )

      const info = {
        bot: this.e.bot.uin,
        group: this.e.isGroup ? this.e.group_id : false,
        id: this.e.user_id,
        message_id: this.e.message_id
      }

      this.masterQQ = Config.sendMaster.Master !== 1 && Config.sendMaster.Master !== 0
        ? Config.sendMaster.Master
        : (Config.masterQQ[0] == "stdin"
            ? (Config.masterQQ[1] ? Config.masterQQ[1] : Config.masterQQ[0])
            : Config.masterQQ[0])
      if (BotId == 0) BotId = this.e.bot.uin
      await sendMasterMsg(msg, BotId)
        .then(() => this.e.reply(`✅ 消息已送达\n主人的QQ：${this.masterQQ}`))
        .then(() => redis.set(key, "1", { EX: cd }))
        .then(() => redis.set(`${key}:${this.e.seq}`, JSON.stringify(info), { EX: 86400 }))
        .catch(err => {
          this.e.reply(`❎ 消息发送失败，请尝试自行联系：${this.masterQQ}\n错误信息：${err}`)
          logger.error(err)
        })
      Sending = false
    } catch (error) {
      this.e.reply("❎ 出错误辣，稍后重试吧")
      logger.error(error)
      Sending = false
    }
  }

  /**
   * 回复消息
   */
  async Replys() {
    if (!this.e.isMaster) return true

    let source
    if (this.e.getReply) {
      source = await this.e.getReply()
    } else if (this.e.source) {
      source = (await this.e.friend.getChatHistory(this.e.source.time, 1)).pop()
    }

    if (!source) return true
    if (!(/联系主人消息/.test(source.raw_message))) return true

    const sourceMsg = source.raw_message.split("\n")[0]
    const regex = /\(([^)]+)\)/
    const match = sourceMsg.match(regex)
    if (!match) return true

    const MsgID = match[1]
    const data = await redis.get(`${key}:${MsgID}`)
    if (!data) {
      this.e.reply("❎ 消息太久远了，下次来早点吧~")
      return
    }

    const { bot, group, id, message_id } = JSON.parse(data)

    this.e.message[0].text = this.e.message[0].text.replace(/#?回复/g, "").trim()
    this.e.message.unshift(`主人(${this.e.user_id})回复：\n`)
    this.e.message.unshift({ type: "reply", id: message_id })

    if (group) {
      Bot[bot].pickGroup(group).sendMsg(this.e.message)
    } else {
      Bot[bot].pickFriend(id).sendMsg(this.e.message)
    }

    this.e.reply("✅ 消息已送达")
  }
}
