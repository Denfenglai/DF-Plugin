import fetch from "node-fetch"
import common from '../../../lib/common/common.js';
//  2024.1.19  5:11 AM
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '随机歌曲',
      /** 功能描述 */
      dsc: '随机网易云音乐',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 40,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^#?来首歌$",
          /** 执行方法 */
          fnc: 'music'
        },
      ]
    });
  }
  
  async music(e) {
    try {
        /** 从API获取数据 */ 
        const response = await fetch(`https://api.suyanw.cn/api/neran.php?hh=\n`);
        /** 获取数据失败 */
        if (!response) return false
        /** 处理数据 */
        const data = await response.text();
        const img = data.match(/https?:\/\/[^ ]+.jpg/g);
        const url = data.match(/(?<=href=").*?(?=")/g);
        const removeImgMatch = data.match(/±img=[^ ]+±/);
        const removeUrlMatch = data.match(/播放链接[^*]+/g);
        const removedImgText = removeImgMatch ? data.replace(removeImgMatch, "") : data;
        const removedUrlText = removeUrlMatch ? removedImgText.replace(removeUrlMatch, "") : removedImgText;
        const msg = [segment.image(`${img}`),removedUrlText,`歌曲直链：\n${url}`]
        /** 处理API错误 */
        if (!url) return e.reply(`获取音乐地址失败，请重试！`)
        /** 发送消息 */
        await e.reply(msg)
        await e.reply(await segment.record(`${url}`))
    } catch (error) {
        e.reply(`发生错误，请稍后重试！`)
    }
  }
}