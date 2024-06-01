import fetch from "node-fetch"

export class api extends plugin {
  constructor() {
    super({
      name: "给我图",
      dsc: "API返回图片",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#?来张?(j|J)(k|K)|制服(小姐姐)?$",
          fnc: "jk"
        },
        {
          reg: "^#?(来张)?黑丝$",
          fnc: "hs"
        },
        {
          reg: "^#?(来张)?(C|c)(O|o)(S|s)$",
          fnc: "cos"
        },
        {
          reg: "^#?(看看腿|来张腿)(子)?$",
          fnc: "kkt"
        }
      ]
    })
  }

  async jk(e) {
    return e.reply(segment.image("https://api.suyanw.cn/api/jk.php"))
  }

  async hs(e) {
    return e.reply([
      "唉嗨害，黑丝来咯",
      segment.image("https://api.suyanw.cn/api/hs.php")
    ])
  }

  async cos(e) {
    return e.reply([
      "cos来咯~",
      segment.image("https://api.suyanw.cn/api/cos.php")
    ])
  }

  async kkt(e) {
    const response = await fetch("https://api.suyanw.cn/api/meitui.php")
    const data = await response.text()
    const links = data.match(/https?:\/\/[^ ]+/g)
    return e.reply([
      "看吧涩批！",
      segment.image(`${links}`)
    ])
  }
}
