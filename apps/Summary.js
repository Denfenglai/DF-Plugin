import { Config } from "#components"
import { Summary as Sum } from "#model"

if (Config.summary.sum) Sum.lint()

export class Summary extends plugin {
  constructor() {
    super({
      name: "DF:图片外显",
      dsc: "图片自动添加外显",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: "^#设置外显",
          fnc: "SetSum"
        },
        {
          reg: "^#?(开启|关闭)(图片)?外显$",
          fnc: "on"
        },
        {
          reg: "^#切换外显模式$",
          fnc: "yiyan"
        }
      ]
    })
  }

  async SetSum(e) {
    if (!e.isMaster) return
    if (!Config.summary.sum) return e.reply("❎ 请先启用该功能！")
    if (Config.summary.type == 2) return e.reply("❎ 该功能在一言模式下不可用，请先关闭一言")
    let sum = e.msg.replace(/^#设置外显/g, "").trim()
    if (!sum) return e.reply("请附带外显内容哦")
    Config.modify("summary", "text", sum)
    return e.reply("✅ 修改成功！")
  }

  async on(e) {
    if (!e.isMaster) return
    const type = /开启/.test(e.msg)
    if ((type && Config.summary.sum) || (!type && !Config.summary.sum)) return e.reply(`❎ 图片外显已处于${type ? "开启" : "关闭"}状态`)
    Config.modify("summary", "sum", type)
    Sum.Switch(type)
    e.reply(`✅ 已${type ? "开启" : "关闭"}图片外显`)
  }

  async yiyan(e) {
    if (!e.isMaster) return
    if (Config.summary.type === 1) {
      Config.modify("summary", "type", 2)
      e.reply("✅ 已切换至一言模式")
    } else {
      Config.modify("summary", "type", 1)
      e.reply("✅ 已切换至自定义文本模式")
    }
  }
}
