import fetch from "node-fetch"
import common from "../../../lib/common/common.js"
import { Config } from "../components/index.js"

const key = "DF:contact"

export class Example extends plugin {
  constructor() {
    super({
      name: "联系主人",
      dsc: "给主人发送一条消息",
      event: "message",
      priority: 400,
      rule: [
        {
          reg: "^#联系主人",
          fnc: "contact"
        }
      ]
    })
  }

  async contact(e) {
    let { open, cd, BotId } = Config.sendMaster
    if (!open) return e.reply("该功能暂未开启，请先让主人开启才能用哦")

    if (await redis.get(key)) {
      e.reply("操作频繁，请稍后再试！")
      return true
    }

    const text = e.msg.replace(/#?联系主人\s?/g, "")
    if (!text) return e.reply("❎ 消息不能为空")

    /** 从API获取触发时间 */
    const response = await fetch("http://quan.suning.com/getSysTime.do")
    const data = await response.json()
    const time = data.sysTime2 || "未知"

    /** 处理发送者信息 */
    const img = e.member.getAvatarUrl()
    const name = e.sender.nickname
    const id = e.user_id
    const bot = e.bot.uin
    const type = e.bot?.version?.id || e?.adapter_id || "QQ"
    const group = e.group_id || "私聊"

    /** 制作消息 */
    const msg = [
      "联系主人消息",
      segment.image(`${img}`),
      `平台: ${type}\n`,
      `昵称：${name}\n`,
      `号码：${id}\n`,
      ` BOT：${bot}\n`,
      `来自：${group}\n`,
      `时间：${time}\n`,
      "消息内容:\n",
      text
    ]

    if (BotId == 0) { BotId = bot }
    await this.sendMasterMsg(msg, BotId)
      .then(() => e.reply(`✅ 消息已送达\n主人的QQ：${Config.masterQQ[0]}`))
      .then(() => redis.set(key, "1", { EX: cd }))
      .catch(err => e.reply(`❎ 消息发送失败，请尝试自行联系：${Config.masterQQ[0]}\n错误信息：${err}`))
  }

  /**
   * 发送主人消息
   * @param msg
   * @param botUin
   */
  async sendMasterMsg(msg, botUin = Bot.uin) {
    const Master = Config.sendMaster.Master
    let masterQQ = Config.masterQQ
    const master = Config.master[botUin]
    if (master?.length) { masterQQ = master }
    if (Master == 1) {
      if (Bot?.sendMasterMsg) {
        await Bot.sendMasterMsg(msg)
      } else {
        for (const i of masterQQ) {
          await common.relpyPrivate(i, msg, botUin)
        }
        await common.sleep(5000)
      }
    } else if (Master == 0) {
      await common.relpyPrivate(masterQQ[0], msg, botUin)
    } else {
      await common.relpyPrivate(Master, msg, botUin)
    }
  }
}
