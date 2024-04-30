import fetch from "node-fetch";
import _ from "lodash";

export class bigPicture extends plugin {

  constructor() {
    super({
      name: "转大图",
      dsc: "发送卡片大图",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: `^#?(转|发)?大图$`,
          fnc: "ImageLink",
        },
      ]
    });
  }

  /**
   * 获取图片链接
   * @param e
   */
  async ImageLink(e) {
    // 获取图片链接
    let img = [];
    if (e.source) {
      let source;
      if (e.isGroup) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop();
      } else {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop();
      }
      img = source.message.filter(i => i.type === "image").map(i => i.url);
    } else {
      img = e.img;
    }

    if (_.isEmpty(img)) {
      this.setContext("_ImageLinkContext");
      await this.reply("⚠ 请发送图片");
      return;
    }
    await e.reply(`✅ 检测到${img.length}张图片`);
    
    // 获取卡片
    let a, msg;
    for (let i of img) {
      a = await this.e.bot.uploadImage(`${i}`);
      msg = await this.DT(a['url'], '喵喵喵！');
      e.reply(segment.json(msg));
    }
  }

  /** 
   * 工具函数：卡片签名
   * @param link - 图片地址
   * @param yx - 卡片外显
   * @return data - 返回数据
   */
  async DT(link, yx = '[图转卡]') {
    logger.mark("卡片签名：", link)
    const response = await fetch(`http://api.mrgnb.cn/API/qq_ark37.php?url=${link}&yx=${yx}`);
    const data = await response.text();
    return data;
  }
}