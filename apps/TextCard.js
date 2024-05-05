import { TextCard } from "../model/index.js"

export class Textcard extends plugin {

  constructor() {
    super({
      name: "文转卡",
      dsc: "文字转卡片",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: '^#?文转卡',
          fnc: "textCard"
        },
      ]
    });
  }
  
  async textCard(e) {
    /** 处理参数 */
    const token = e.msg.replace(/#?文转卡/, "").trim()
    const parts = token.split(':')
    /** 标题 */
    const bt = parts[0] || ''
    /** 消息 */
    const msg = parts[1] ||' '
    /** 外显 */
    const yx = parts[2] || '[DF文转卡]'
    
    const data = await TextCard(msg, bt, yx)
    await e.reply(segment.json(data))
 }
}