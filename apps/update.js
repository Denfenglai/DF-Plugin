let Update
const PLUGIN_NAME = "DF-Plugin"

try {
  Update = (await import("../../other/update.js")).update
} catch {
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
          reg: "^#(DF|大粪)(插件)?(强制)?更新$",
          fnc: "update"
        },
        {
          reg: "^#(DF|大粪)(插件)?更新日志$",
          fnc: "updateLog"
        }
      ]
    })
  }

  async update(e = this.e) {
    const Type = e.msg.includes("强制") ? "#强制更新" : "#更新"
    e.msg = Type + PLUGIN_NAME
    const up = new Update(e)
    up.e = e
    return up.update()
  }

  async updateLog(e = this.e) {
    e.msg = "#更新日志" + PLUGIN_NAME
    const up = new Update(e)
    up.e = e
    return up.updateLog()
  }
}