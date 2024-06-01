import { update as Update } from "../../other/update.js"

export class DFupdate extends plugin {
  constructor() {
    super({
      name: "DF更新插件",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: /^#*DF(插件)?(强制)?更新$/i,
          fnc: "update"
        }
      ]
    })
  }

  async update(e = this.e) {
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新DF-Plugin`
    const up = new Update(e)
    up.e = e
    return up.update()
  }
}
