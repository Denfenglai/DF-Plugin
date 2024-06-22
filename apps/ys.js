import { Config } from "../components/index.js"

const ys = {}

export class genshin extends plugin {
  constructor() {
    super()
    this.name = "DF:原神关键词发图"
    this.dsc = "本来聊得好好的，突然有人聊起了原神，搞得大家都不高兴"
    this.event = "message.group"
    this.priority = 5001
    this.rule = [
      {
        reg: /原神/,
        fnc: this.ys.name
      }
    ]
  }

  async ys() {
    if (ys[this.e.group_id] || !Config.other.ys) return false
    this.reply(segment.image(`${process.cwd()}/plugins/DF-Plugin/resources/img/ys.png`))
    ys[this.e.group_id] = true
    return true
  }
}
