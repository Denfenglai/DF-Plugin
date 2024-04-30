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
          reg: '^#?转?大图', // 转大图
          fnc: "imageCard"
        },
      ]
    });
  }

  async imageCard(e) {
    /** 获取图片链接 */
    const img = await this.ImageLink(e)
    if (!img) return false
    
    /** 处理参数 */
    const token = e.msg.replace(/^#?转?大图/, "").trim()
    const parts = token.split(':')
    /** 标题 */
    const title = parts[0] ||''
    /** 子标题 */
    const sub = parts[1] || ''
    /** 外显 */
    const yx = parts[2] || ''
    
    let link, msg;
    for (let i of img) {
      /** 双重编码URL */
      const encoded = encodeURIComponent(i);
      link = encodeURIComponent(encoded);
      /** 生成卡片代码 */
      msg = await this.DT(link, title, sub, yx);
      await e.reply(segment.json(msg));
    }
  }

  /**
   * 工具函数：获取图片链接
   * @param e - 消息事件
   * @return img - 图片链接数组
   */
  async ImageLink(e) {
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
      await this.reply("⚠ 请回复或带图使用");
      return false
    }
    await e.reply(`✅ 检测到${img.length}张图片`);
    return img
  }

  /** 
   * 工具函数：生成卡片代码
   * @param link - 图片地址
   * @param title - 标题
   * @param subtitle - 子标题
   * @param yx - 卡片外显
   * @return data - json卡片代码
   */
  async DT(link, title='', subtitle='', yx='[图转卡]') {
    logger.mark("卡片签名:", link)
    const response = await fetch(`http://api.mrgnb.cn/API/qq_ark37.php?url=${link}&title=${title}&subtitle=${subtitle}&yx=${yx}`);
    const data = await response.text();
    return data;
  }
}