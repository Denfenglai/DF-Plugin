import { Config } from "#components"
import { CodeUpdate as Cup } from "#model"

export class CodeUpdate extends plugin {
  constructor() {
    super({
      name: "DF:仓库更新推送",
      dsc: "检查指定Git仓库是否更新并推送",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: "^#检查仓库更新$",
          fnc: "cupdate"
        }
      ]
    })

    if (Config.CodeUpdate.Auto) {
      this.task = {
        cron: Config.CodeUpdate.Cron,
        name: "[DF-Plugin]Git仓库更新检查",
        fnc: () => Cup.checkUpdates(true)
      }
    }
  }

  async cupdate(e) {
    await Cup.checkUpdates(false, e)
  }
}
