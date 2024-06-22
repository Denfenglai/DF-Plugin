import { Config } from "../components/index.js"

const ys = {}

export class genshin extends plugin {
  constructor() {
    super({
      name: "DF:原神关键词发图",
      dsc: "本来聊得好好的，突然有人聊起了原神，搞得大家都不高兴",
      event: "message.group",
      priority: 5001,
      rule: [
        {
          reg: "原神",
          fnc: "ys"
        }
      ]
    })
  }

  async ys() {
    if (ys[this.e.group_id] || !Config.other.ys) return false
    this.reply(segment.image(`${process.cwd()}/plugins/DF-Plugin/resources/img/ys.png`))
    ys[this.e.group_id] = true
    return false
  }
}
