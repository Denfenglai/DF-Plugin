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
return e.reply('大图卡片已于2024年5月6日被和谐，如有其他方法我会立即尝试恢复（文转卡似乎没被和谐）')
//    /** 获取图片链接 */
//    const img = await ImageLink(e)
//    if (!img) return false
    
//    /** 处理参数 */
//    const token = e.msg.replace(/#?(转?大图|图转卡)/, "").trim()
//    const parts = token.split(':')
//    /** 标题 */
//    const title = parts[0] ||''
//    /** 子标题 */
//    const sub = parts[1] || ''
//    /** 外显 */
//    const yx = parts[2] || '[DF图转卡]'
//    
//    for (let i of img) {
//      /** 编码URL */
//      const encoded = encodeURIComponent(i);
//      const link = encoded
//      /** 生成卡片代码 */
//      const msg = await ImageCard(link, title, sub, yx);
//      await e.reply(segment.json(msg));
//    }
  }
}