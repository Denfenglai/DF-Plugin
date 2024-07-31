import { Config } from "../components/index.js"
import Sum from "../model/summary.js"

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
          reg: "^#?(开启|关闭)外显$",
          fnc: "on"
        }
      ]
    })
  }

  async SetSum(e) {
    if (!Config.summary.sum) return e.reply("❎ 请先启用该功能！")
    let sum = e.msg.replace(/^#设置外显/g, "").trim()
    if (!sum) return e.reply("请附带外显内容哦")
    Config.modify("summary", "text", sum)
    return e.reply("✅ 修改成功！")
  }

  async on(e) {
    const type = /开启/.test(e.msg)
    Config.modify("summary", "sum", type)
    Sum.Switch(type)
    e.reply(`✅ 已${type ? "开启" : "关闭"}图片外显`)
  }
}
