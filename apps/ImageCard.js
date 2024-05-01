import fetch from "node-fetch";
import { ImageLink } from "../model/imgLink.js"

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
      msg = await this.DT(link, title, sub, yx);
      await e.reply(segment.json(msg));
    }
  }


  /** 
   * 工具函数：生成卡片代码
   * @param link - 图片地址
   * @param title - 标题
   * @param subtitle - 子标题
   * @param yx - 卡片外显
   * @return data - json卡片代码
   */
  async DT(link, title, subtitle, yx) {
    logger.mark("卡片签名:", link)
    const response = await fetch(`http://api.mrgnb.cn/API/qq_ark37.php?url=${link}&title=${title}&subtitle=${subtitle}&yx=${yx}`);
    const data = await response.text();
    return data;
  }
}