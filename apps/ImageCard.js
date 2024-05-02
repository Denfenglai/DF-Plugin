import { ImageLink, ImageCard } from "../model/index.js"

export class bigPicture extends plugin {

  constructor() {
    super({
      name: "转大图",
      dsc: "发送卡片大图",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: '^#?(转?大图|图转卡)', // 转大图
          fnc: "imageCard"
        },
      ]
    });
  }

  async imageCard(e) {
    /** 获取图片链接 */
    const img = await ImageLink(e)
    if (!img) return false
    
    /** 处理参数 */
    const token = e.msg.replace(/#?(转?大图|图转卡)/, "").trim()
    const parts = token.split(':')
    /** 标题 */
    const title = parts[0] ||''
    /** 子标题 */
    const sub = parts[1] || ''
    /** 外显 */
    const yx = parts[2] || '[DF图转卡]'
    
    let link, msg;
    for (let i of img) {
      /** 双重编码URL */
      const encoded = encodeURIComponent(i);
      link = encodeURIComponent(encoded);
      /** 生成卡片代码 */
      msg = await ImageCard(link, title, sub, yx);
      await e.reply(segment.json(msg));
    }
  }
}