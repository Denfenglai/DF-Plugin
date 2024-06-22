import { Config } from "../components/index.js"
import { randomFile } from "../model/index.js"

// 配置请看 config/other.yaml
const type = [ "default", "柴郡猫", "丛雨", "诗歌剧", "千恋万花", "小南梁" ]
const PluginPath = `${process.cwd()}/plugins/DF-Plugin`

export class Chuo extends plugin {
  constructor() {
    super()
    this.name = "DF:戳一戳"
    this.dsc = "戳一戳机器人发送随机表情包"
    this.event = "notice.group.poke"
    this.priority = 114
    this.rule = [ { fnc: this.poke.name } ]
  }

  async poke() {
    const { chuo, chuoType } = Config.other
    if (!chuo) return true
    if (this.e.target_id == this.e.self_id) {
      const path = `${PluginPath}/resources/chuo/${type[chuoType]}`
      const file = await randomFile(path)
      this.e.reply(segment.image(file))
    }
  }
}
