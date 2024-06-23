let Update

try {
  Update = (await import("../../other/update.js")).update
} catch (err) {
  try {
    Update = (await import("../../system/apps/update.ts")).update
  } catch (err) {
    logger.warn("[DF-Plugin] 导入本体更新模块失败，将无法使用 #DF更新 命令")
  }
}

export class DFupdate extends plugin {
  constructor() {
    super({
      name: "DF更新插件",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: "#(DF|大粪)(插件)?(强制)?更新$",
          fnc: "update"
        }
      ]
    })
  }

  async update(e = this.e) {
    const forced = e.msg.includes("强制") ? "强制" : ""
    e.msg = `#${forced}更新DF-Plugin`
    const up = new Update(e)
    up.e = e
    return up.update()
  }
}
