import fs from "node:fs"
import _ from "lodash"
import { imagePoke } from "../model/index.js"
import { Config, Poke_List, Poke_Path } from "../components/index.js"

if (!fs.existsSync(Poke_Path) && Config.other.chuo) logger.mark("[DF-Plugin] 检测到未安装戳一戳图库 将调用XY-Api返回图片")

export class Poke extends plugin {
  constructor() {
    super({
      name: "DF:戳一戳",
      dsc: "戳一戳机器人发送随机表情包",
      event: "notice.group.poke",
      priority: -114,
      rule: [ { fnc: "poke" } ]
    })
  }

  async poke() {
    const { chuo, chuoType } = Config.other
    if (!chuo) return false
    if (this.e.target_id != this.e.self_id) return false
    let name
    if (chuoType === "all") {
      name = _.sample(Poke_List)
    } else {
      name = Poke_List[chuoType]
    }
    if (!name) return false
    const file = imagePoke(name)
    if (!file) return false
    return this.e.reply(segment.image(file))
  }
}
