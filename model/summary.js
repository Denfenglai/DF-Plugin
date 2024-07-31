import fetch from "node-fetch"
import { Config } from "../components/index.js"
import { segment as Segment } from "oicq"

export default new class Summary {
  lint() {
    segment.image = (file, name) => ({
      type: "image",
      file,
      name,
      summary: Config.summary.text
    })
  }

  async getSummary() {
    let data
    if (Config.summary.type === 2) {
      try {
        data = (await fetch(Config.summary.api)).text()
      } catch (err) {
        logger.error(`获取一言接口时发生错误：${err}`)
      }
    }
    return data ?? Config.summary.text
  }

  async Switch(value) {
    if (value) {
      this.lint()
    } else {
      segment.image = Segment.image
    }
  }
}()
