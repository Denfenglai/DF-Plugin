import fetch from "node-fetch"
import { imagePoke as RandomFace } from "../model/index.js"
import { Config, Poke_List as Face_List } from "../components/index.js"

export class Random_Picturs extends plugin {
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
          reg: `^#?(随机|来张)?(${Face_List.join("|")})$`,
          fnc: "Face"
        }
      ]
    })
  }

  get open() {
    return Config.Picture.open
  }

  async jk(e) {
    if (!this.open) return false
    return e.reply(segment.image("https://api.suyanw.cn/api/jk.php"), true)
  }

  async hs(e) {
    if (!this.open) return false
    return e.reply([
      "唉嗨害，黑丝来咯",
      segment.image("https://api.suyanw.cn/api/hs.php")
    ], true)
  }

  async cos(e) {
    if (!this.open) return false
    const resp = await fetch("https://api.suyanw.cn/api/cos.php?type=json")
    const data = await resp.json()
    const links = data.text.replace(/\\/g, "/")
    return e.reply([
      "cos来咯~",
      segment.image(links)
    ], true)
  }

  async kkt(e) {
    if (!this.open) return false
    const resp = await fetch("https://api.suyanw.cn/api/meitui.php")
    const data = await resp.text()
    const links = data.match(/https?:\/\/[^ ]+/g)
    return e.reply([
      "看吧涩批！",
      segment.image(`${links}`)
    ], true)
  }

  async Face(e) {
    if (!this.open) return false
    if (!(e.msg.includes("随机") || e.msg.includes("来张") || Config.Picture.Direct)) return false
    const name = e.msg.replace(/#|随机|来张/g, "")
    const file = RandomFace(name)
    if (!file) return false
    return e.reply(segment.image(file))
  }
}
