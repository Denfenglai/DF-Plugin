import { Config } from "../components/index.js"
const ys = {}

export class genshin extends plugin {
  constructor() {
    super({
      name: "懒得喷",
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
    setTimeout(() => delete ys[this.e.group_id], 900000)
    return false
  }
}