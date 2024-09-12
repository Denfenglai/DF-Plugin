import moment from "moment"
import common from "../lib/common/common.js"
import { Config } from "../components/index.js"
import { sendMasterMsg, extractMessageId, getSourceMessage, getMasterQQ } from "../model/sendMasterMsg.js"

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

    let { open, cd, BotId, sendAvatar, banWords, banUser, banGroup } = Config.sendMaster
    if (!e.isMaster) {
      if (!open) return e.reply("❎ 该功能暂未开启，请先让主人开启才能用哦", true)
      if (cd != 0 && await redis.get(key)) return e.reply("❎ 操作频繁，请稍后再试", true)
      if (banWords.some(item => e.msg.includes(item))) return e.reply("❎ 消息包含违禁词，请检查后重试", true)
      if (banUser.includes(e.user_id)) return e.reply("❎ 对不起，您不可用", true)
      if (e.isGroup && banGroup.includes(e.group_id)) return e.reply("❎ 该群暂不可用该功能", true)
    }

    Sending = true

    try {
      const message = await common.Replace(e, /#联系主人/)
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
        bot: e.bot.uin || Bot.uin,
        group: e.isGroup ? e.group_id : false,
        id: e.user_id,
        message_id: e.message_id
      }

      const masterQQ = getMasterQQ(Config.sendMaster)

      if (!Bot[BotId]) BotId = e.self_id

      try {
        await sendMasterMsg(msg, BotId)
        await e.reply(`✅ 消息已送达\n主人的QQ：${masterQQ}`, true)
        if (cd) redis.set(key, "1", { EX: cd })
        redis.set(`${key}:${e.seq}`, JSON.stringify(info), { EX: 86400 })
      } catch (err) {
        await e.reply(`❎ 消息发送失败，请尝试自行联系：${masterQQ}\n错误信息：${err}`)
        logger.error(err)
      }
    } catch (err) {
      e.reply("❎ 出错误辣，稍后重试吧")
      logger.error(err)
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
      const source = await getSourceMessage(e)
      if (!source || !(/联系主人消息/.test(source.raw_message))) return false

      const MsgID = extractMessageId(source.raw_message)
      if (!MsgID) return false

      const data = await redis.get(`${key}:${MsgID}`)
      if (!data) return e.reply("消息太久远了，下次来早点吧~")

      const { bot, group, id, message_id } = JSON.parse(data)
      const message = await common.Replace(e, /#?回复/g)
      message.unshift(`主人(${e.user_id})回复：\n`, segment.reply(message_id))

      this.Bot = Bot[bot] ?? Bot

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
}
