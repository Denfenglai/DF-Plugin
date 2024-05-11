import { Config } from "../components/index.js"

export class genshin extends plugin {

  constructor() {
    super({
      name: "懒得喷",
      dsc: "本来聊得好好的，突然有人聊起了原神，搞得大家都不高兴",
      event: "message.group",
      priority: 5001,
      rule: [
        {
          reg: '原神',
          fnc: 'ys'
        },
      ]
    });
  }
  
  async ys() {
    if ( !Config.other.ys ) return false
    let key = `DF:img:ys:${this.e.group_id}`
    if (await redis.get(key)) return false
    this.reply(segment.image(`${process.cwd()}/plugins/DF-Plugin/resources/img/ys.png`))
    redis.set(key, '1', { EX: 900 })
    return false
  }
}