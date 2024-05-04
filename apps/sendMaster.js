import fetch from "node-fetch";
import common from '../../../lib/common/common.js';
import Config from '../../../lib/config/config.js';

const cd = 300 

export class Example extends plugin {
  constructor() {
    super({
      name: '联系主人',
      dsc: '给主人发送一条消息',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: "^#联系主人\s?(.*)",
          fnc: 'contact'
        },
      ]
    });
  }
  
  async contact(e) {
    let key = `DF:contact:${this.e.user_id}`;
    if (await redis.get(key)) { 
      this.e.reply("操作频繁，请稍后再试！");
      return true;
    }

    let BotList = [e.self_id]
    if (Array.isArray(Bot?.uin)) {
      BotList = Bot.uin;
    } else if (!Array.isArray(Bot?.uin) && Bot?.adapter && Bot?.adapter.includes(e.self_id)) {
      BotList = Bot.adapter;
    }

    const text = e.msg.replace(/#?联系主人\s?/g, '')
    if (!text) return e.reply('❎ 消息不能为空')

    const response = await fetch(`http://quan.suning.com/getSysTime.do`);
    const data = await response.json();
    const time = data.sysTime2;

    const img  = e.member.getAvatarUrl()
    const name = e.sender.nickname
    const id   = e.user_id
    const bot  = e.bot.uin
    const type = e.bot?.version.id || 'QQ'
    const group = e.group_id || `私聊`

    const msg = [
      "联系主人消息",
      segment.image(`${img}`),
      `平台: ${type}\n`,
      `昵称：${name}\n`,
      `号码：${id}\n`,
      ` BOT：${bot}\n`,
      `来自：${group}\n`,
      `时间：${time}\n`,
      `消息内容:\n`,
      text
    ];
    
    /** 默认发送第一个主人 */
    let masterQQ = Config.masterQQ
    if (Config.master) {
      const master = Config.master[bot]
      if (master?.length) { masterQQ = master }
    }
    
    await Bot[bot].pickFriend(masterQQ[0]).sendMsg(msg)
      .then(() => e.reply(`✅ 消息已送达\n主人的QQ：${masterQQ[0]}`))
      .then(() => redis.set(key, '1', { EX: cd }))
      .catch(err => e.reply(`❎ 消息发送失败`));

  }
}