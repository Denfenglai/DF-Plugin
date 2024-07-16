import fetch from "node-fetch"
import { randomFile } from "../model/index.js"
import { Plugin_Path } from "../components/index.js"

export class api extends plugin {
  constructor() {
    super({
      name: "DF:随机图片",
      dsc: "随机返回一张图片",
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
        },
        {
          reg: "^#?(随机|来张)(丛雨|幼刀|村雨|绫|粽子精)$",
          fnc: "Murasame"
        },
        {
          reg: "^#?(随机|来张)((待兼)?诗歌剧|诗宝)$",
          fnc: "Matik"
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

  async Murasame(e) {
    const file = await randomFile(`${Plugin_Path}/resources/chuo/丛雨`)
    if (!file) return false
    return e.reply(segment.image(file))
  }

  async Matik(e) {
    const file = await randomFile(`${Plugin_Path}/resources/chuo/诗歌剧`)
    if (!file) return false
    return e.reply(segment.image(file))
  }
}
