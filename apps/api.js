import fetch from "node-fetch"

export class api extends plugin {
  constructor() {
    super({
      name: "DF:随机图片API",
      dsc: "API返回图片",
      event: "message",
      priority: 500,
      rule: [
        {
          reg: "^#?来张([jJ][kK]|制服(小姐姐)?)?$",
          fnc: "jk"
        },
        {
          reg: "^#?来张黑丝$",
          fnc: "hs"
        },
        {
          reg: "^#?来张[Cc][Oo][Ss]$",
          fnc: "cos"
        },
        {
          reg: "^#?(看看|来张)腿子?$",
          fnc: "kkt"
        }
      ]
    })
  }

  async jk(e) {
    return e.reply(segment.image("https://api.suyanw.cn/api/jk.php"), true)
  }

  async hs(e) {
    return e.reply([
      "唉嗨害，黑丝来咯",
      segment.image("https://api.suyanw.cn/api/hs.php")
    ], true)
  }

  async cos(e) {
    const resp = await fetch("https://api.suyanw.cn/api/cos.php?type=json")
    const data = await resp.json()
    const links = data.text.replace(/\\/g, "/")
    return e.reply([
      "cos来咯~",
      segment.image(links)
    ], true)
  }

  async kkt(e) {
    const resp = await fetch("https://api.suyanw.cn/api/meitui.php")
    const data = await resp.text()
    const links = data.match(/https?:\/\/[^ ]+/g)
    return e.reply([
      "看吧涩批！",
      segment.image(`${links}`)
    ], true)
  }
}
