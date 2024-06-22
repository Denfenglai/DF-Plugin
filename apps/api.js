import fetch from "node-fetch"

export class api extends plugin {
  constructor() {
    super()
    this.name = "DF:给我图"
    this.dsc = "API返回图片"
    this.event = "message"
    this.priority = 500
    this.rule = [
      {
        reg: /^#?来张?(j|J)(k|K)|制服(小姐姐)?$/,
        fnc: this.jk.name
      },
      {
        reg: /^#?(来张)?黑丝$/,
        fnc: this.hs.name
      },
      {
        reg: /^#?(来张)?(C|c)(O|o)(S|s)$/,
        fnc: this.cos.name
      },
      {
        reg: /^#?(看看腿|来张腿)(子)?$/,
        fnc: this.kkt.name
      }
    ]
  }

  async jk() {
    this.e.reply(segment.image("https://api.suyanw.cn/api/jk.php"), true)
  }

  async hs() {
    this.e.reply([
      "唉嗨害，黑丝来咯",
      segment.image("https://api.suyanw.cn/api/hs.php")
    ], true)
  }

  async cos() {
    this.e.reply([
      "cos来咯~",
      segment.image("https://api.suyanw.cn/api/cos.php")
    ], true)
  }

  async kkt() {
    const response = await fetch("https://api.suyanw.cn/api/meitui.php")
    const data = await response.text()
    const links = data.match(/https?:\/\/[^ ]+/g)
    this.e.reply([
      "看吧涩批！",
      segment.image(`${links}`)
    ], true)
  }
}
