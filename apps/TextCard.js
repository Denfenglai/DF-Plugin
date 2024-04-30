import fetch from "node-fetch";

export class TextCard extends plugin {

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
    /** 消息 */
    const msg = parts[0] ||''
    /** 标题 */
    const bt = parts[1] || ''
    /** 外显 */
    const yx = parts[2] || '[DF文转卡]'
    if (!msg) return e.reply('文字内容不能为空！')
    
    const data = await this.ark(msg, bt, yx)
    await e.reply(segment.json(data))
 }
 
   /**
    * 生成卡片消息
    * @param msg - 消息内容
    * @param bt - 标题
    * @param yx - 外显
    * @return data - 卡片数据
    */
  async ark(msg, bt, yx) {
    const response = await fetch(`http://api.mrgnb.cn/API/qq_ark.php?name=${msg}&title=${bt}&yx=${yx}`);
    const data = await response.text();
    return data;
  }
}