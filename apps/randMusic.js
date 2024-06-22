import fetch from "node-fetch"

//  初次编写时间：2024.1.19  5:11 AM

export class RandomMusics extends plugin {
  constructor() {
    super()
    this.name = "DF:随机歌曲"
    this.dsc = "随机网易云音乐"
    this.event = "message"
    this.priority = 400
    this.rule = [
      {
        reg: /^#?来首歌$/,
        fnc: this.music.name
      }
    ]
  }

  async music(e) {
    try {
      /** 从API获取数据 */
      const response = await fetch("https://api.suyanw.cn/api/neran.php?hh=\n")
      /** 获取数据失败 */
      if (!response) {
        this.e.reply("获取歌曲信息失败，请稍后重试！")
        return
      }
      /** 处理数据 */
      const data = await response.text()
      const img = data.match(/https?:\/\/[^ ]+.jpg/g)
      const url = data.match(/(?<=href=").*?(?=")/g)
      const removeImgMatch = data.match(/±img=[^ ]+±/)
      const removeUrlMatch = data.match(/播放链接[^*]+/g)
      const removedImgText = removeImgMatch ? data.replace(removeImgMatch, "") : data
      const removedUrlText = removeUrlMatch ? removedImgText.replace(removeUrlMatch, "") : removedImgText
      const msg = [ segment.image(`${img}`), removedUrlText, `歌曲直链：\n${url}` ]
      /** 处理API错误 */
      if (!url) {
        this.e.reply("获取音乐地址失败，请重试！")
        return
      }
      /** 发送消息 */
      await e.reply(msg)
      await e.reply(await segment.record(`${url}`))
    } catch (error) {
      e.reply("发生错误，请稍后重试！")
    }
  }
}
