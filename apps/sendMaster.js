import cfg from "../../../lib/config/config.js"
import moment from "moment"
import { Config } from "../components/index.js"
import { sendMasterMsg } from "../model/index.js"

const key = "DF:contact"
let Sending = false

segment.reply ??= (id) => ({ type: "reply", id })

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
   * @param {object} e - 消息事件
   */
  async contact(e) {
    if (Sending) return e.reply("❎ 已有发送任务正在进行中，请稍候重试")

    const { open, cd, BotId, sendAvatar } = Config.sendMaster
    if (!open) return e.reply("❎ 该功能暂未开启，请先让主人开启才能用哦")
    if (await redis.get(key) && !e.isMaster) return e.reply("❎ 操作频繁，请稍后再试！")

    Sending = true

    try {
      const message = await this.Replace(e, /#联系主人/)
      if (message.length === 0) return e.reply("❎ 消息不能为空")

      const type = e.bot?.version?.id || e?.adapter_id || "QQ"
      const img = e.member?.getAvatarUrl() || e.friend.getAvatarUrl()
      const id = `${e.sender.nickname}(${e.user_id})`
      const group = e.isGroup ? `${e.group.name}(${e.group_id})` : "私聊"
      const bot = `${e.bot.nickname}(${e.bot.uin})`
      const time = moment().format("YYYY-MM-DD HH:mm:ss")

      const msg = [
        `联系主人消息(${e.seq})\n`,
        sendAvatar ? segment.image(img) : "",
        `平台: ${type}\n`,
        `用户: ${id}\n`,
        `来自: ${group}\n`,
        `BOT: ${bot}\n`,
        `时间: ${time}\n`,
        "消息内容:\n",
        ...message,
        "\n-------------\n",
        "引用该消息：#回复 <内容>"
      ]

      const info = {
        bot: e.bot.uin,
        group: e.isGroup ? e.group_id : false,
        id: e.user_id,
        message_id: e.message_id
      }

      const masterQQ = this.getMasterQQ(Config.sendMaster)
      await sendMasterMsg(msg, BotId || e.bot?.uin)
        .then(() => e.reply(`✅ 消息已送达\n主人的QQ：${masterQQ}`))
        .then(() => redis.set(key, "1", { EX: cd }))
        .then(() => redis.set(`${key}:${e.seq}`, JSON.stringify(info), { EX: 86400 }))
        .catch((err) => {
          e.reply(`❎ 消息发送失败，请尝试自行联系：${masterQQ}\n错误信息：${err}`)
          logger.error(err)
        })
    } catch (error) {
      e.reply("❎ 出错误辣，稍后重试吧")
      logger.error(error)
    } finally {
      Sending = false
    }
  }

  /**
   * 回复消息
   * @param {object} e - 消息事件
   */
  async Replys(e) {
    if (!e.isMaster) return false

    try {
      const source = await this.getSourceMessage(e)
      if (!source || !(/联系主人消息/.test(source.raw_message))) return false

      const MsgID = this.extractMessageId(source.raw_message)
      if (!MsgID) return false

      const data = await redis.get(`${key}:${MsgID}`)
      if (!data) return e.reply("消息太久远了，下次来早点吧~")

      const { bot, group, id, message_id } = JSON.parse(data)
      const message = await this.Replace(e, /#?回复/g)
      message.unshift(`主人(${e.user_id})回复：\n`, segment.reply(message_id))

      this.Bot = Bot[bot] ?? e.bot ?? Bot

      if (group) {
        await this.Bot.pickGroup(group).sendMsg(message)
      } else {
        await this.Bot.pickFriend(id).sendMsg(message)
      }

      return e.reply("✅ 消息已送达")
    } catch (err) {
      e.reply("❎ 发生错误，请查看控制台日志")
      logger.error("[DF-Plugin]回复消息时发生错误：", err)
      return false
    }
  }

  /**
   * 处理消息内容
   * @param {object} e - 消息事件
   * @param {RegExp} Reg - 正则表达式
   * @returns {object} message - 处理后的消息内容数组
   */
  async Replace(e = this.e, Reg = null) {
    const message = e.message.filter((item) => item.type != "at")

    for (let msgElement of message) {
      if (msgElement.type === "text") {
        if (Reg) msgElement.text = msgElement.text.replace(Reg, "").trim()

        if (e.hasAlias && e.isGroup) {
          let groupCfg = cfg.getGroup(e.group_id)
          let alias = groupCfg.botAlias

          if (!Array.isArray(alias)) alias = [ alias ]

          for (let name of alias) {
            if (msgElement.text.startsWith(name)) {
              msgElement.text = msgElement.text.slice(name.length).trim()
              break
            }
          }
        }
      }
    }
    return message
  }

  /**
   * 获取主人QQ
   * @param {object} config - 配置
   * @returns {string} 主人QQ
   */
  getMasterQQ(config) {
    if (config.Master !== 1 && config.Master !== 0) {
      return config.Master
    }
    return Config.masterQQ[0] === "stdin" ? (Config.masterQQ[1] || Config.masterQQ[0]) : Config.masterQQ[0]
  }

  /**
   * 获取源消息
   * @param {object} e - 消息事件
   * @returns {object} 源消息
   */
  async getSourceMessage(e) {
    if (e.getReply) {
      return await e.getReply()
    } else if (e.source) {
      return (await e.friend.getChatHistory(e.source.time, 1)).pop()
    }
    return null
  }

  /**
   * 提取消息ID
   * @param {string} rawMessage - 原始消息
   * @returns {string} 消息ID
   */
  extractMessageId(rawMessage) {
    const regex = /\(([^)]+)\)/
    const match = rawMessage.match(regex)
    return match ? match[1] : null
  }
}
