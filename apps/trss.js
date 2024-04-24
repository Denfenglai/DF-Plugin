let trss = false
let id = 2536554304
let name = '时雨'
let msg = name+'快来'
let text = name+'归来'

export class SummonShigure extends plugin {

  constructor() {
    super({
      name: "召唤时雨",
      dsc: "召唤时雨直到他回复",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: `^#召唤${name}$`,
          fnc: "summon",
          permission: "master",
        },
        {
          reg: "^#结束召唤$",
          fnc: "sb时雨"
        }
      ]
    })
  }

  async summon(e) {
    if (trss) return;
    trss = true;
    this.userId = id
    this.setContext("食欲")
    while (trss) {
      e.reply([segment.at(id), msg]);
      await Bot.sleep(1000)
      if (!trss) break
    }
  }
  
  async sb时雨() {
    if (!trss) return
    trss = false
    this.finish("食欲")
  }
  
  async 食欲() {
    trss = false
    this.reply(text,true)
    this.finish("食欲")
  }
}