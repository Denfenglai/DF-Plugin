import fetch from "node-fetch"

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '给我图',
      /** 功能描述 */
      dsc: 'API返回图片',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 500,
   rule: [
        {
          reg: "^#?来张?(j|J)(k|K)|制服(小姐姐)?",
          fnc: 'jk'
        },
        {
          reg: "^#?(来张)?黑丝",
          fnc: 'hs'
        },
        {
          reg: "^#?(来张)?(C|c)(O|o)(S|s)",
          fnc: 'cos'
        },
        {
          reg: "^#?(看看腿|来张腿)(子)?",
          fnc: 'kkt'
        }
    ]
    })
  }
  
  async jk(e) {
      e.reply(segment.image(`https://api.suyanw.cn/api/jk.php`));
      return true; 
  }
      
  async hs(e) {
      e.reply(["唉嗨害，黑丝来咯",segment.image(`https://api.suyanw.cn/api/hs.php`)]);   
      return true;
      }

  async cos(e) {
      e.reply(["cos来咯~",segment.image(`https://api.suyanw.cn/api/cos.php`)]);
      return true;
        }
  async kkt(e) {
      const response = await fetch(`https://api.suyanw.cn/api/meitui.php`);
      const data = await response.text();
      const links = data.match(/https?:\/\/[^ ]+/g); // 提取出链接
      e.reply(["看吧涩批！",segment.image(`${links}`)]);
      return true;
      }
  }      
    
  