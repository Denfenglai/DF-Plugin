import { Version, common } from "#components"

export class Version_Info extends plugin {
  constructor() {
    super({
      name: "DF:版本信息",
      event: "message",
      priority: 400,
      rule: [
        {
          reg: "^#?DF(插件)?版本$",
          fnc: "plugin_version"
        }
      ]
    })
  }

  async plugin_version(e) {
    return await common.render("help/version-info", {
      currentVersion: Version.ver,
      changelogs: Version.logs,
      elem: "cryo"
    }, { e, scale: 1.4 }
    )
  }
}
