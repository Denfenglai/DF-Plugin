let Update
try {
  Update = (import("../../system-plugin/apps/update.ts").update)
} catch (err) {
  logger.error("[DF-Plugin] 导入本体更新模块失败，将无法使用 #DF更新 命令")
}

export class DFupdate extends plugin {
  constructor() {
    super()
    this.name = "DF:更新插件"
    this.event = "message"
    this.priority = 1000
    this.rule = [
      {
        reg: /^#(DF|大粪)(插件)?(强制)?更新$/,
        fnc: this.update.name
      }
    ]
  }

  async update(e = this.e) {
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新DF-Plugin`
    const up = new Update(e)
    up.e = e
    await up.update()
  }
}
