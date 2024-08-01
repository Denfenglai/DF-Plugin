import { Version, Common } from "../components/index.js"

export class NewVersion extends plugin {
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
    return await Common.render("help/version-info", {
      currentVersion: Version.ver,
      changelogs: Version.logs,
      elem: "cryo"
    }, { e, scale: 1.4 }
    )
  }
}
