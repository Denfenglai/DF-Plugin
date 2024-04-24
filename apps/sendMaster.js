import fetch from "node-fetch";
import common from '../../../lib/common/common.js';
import cfg from '../../../lib/config/config.js';

let cd = 300 
let Bot_id = 0
let Master_id = 0

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

    if (!Bot_id) {
      Bot_id = this.e.self_id;
    }
    if (!Master_id) {
      Master_id = cfg.masterQQ[0];
    }
    let BotList = [e.self_id]

    if (Array.isArray(Bot?.uin)) {
      BotList = Bot.uin;
    } else if (!Array.isArray(Bot?.uin) && Bot?.adapter && Bot?.adapter.includes(e.self_id)) {
      BotList = Bot.adapter;
    }

    if (!(BotList.includes(Bot_id))) {
      e.reply("❎ 错误：Bot_id不存在，请检查Bot是否上线或Bot_id错误：\n${Bot_id}");
      logger.error("[联系主人]致命错误：未找到对应Bot");
      return false;
    }

    if (!Bot[Bot_id].fl.get(Master_id)) {
      e.reply('❎ 错误：Bot未找到主人好友，请检查Master_id是否正确：\n${Master_id}')
      return false;
    }

    const text = [ e.msg.replace(/#?联系主人\s?/g, '') ]
    if (!text) return e.reply('❎ 消息不能为空')

    const response = await fetch(`http://quan.suning.com/getSysTime.do`);
    const data = await response.json();
    const time = data.sysTime2;

    const img  = e.member.getAvatarUrl()
    const name = e.sender.nickname
    const id   = e.user_id
    const bot  = e.self_id
    const type = e.bot?.version.id || 'QQ'
    const group = e.group_id || `私聊`

    const Info = [
      "联系主人消息",
      segment.image(`${img}`),
      `平台: ${type}\n`,
      `昵称：${name}\n`,
      `号码：${id}\n`,
      ` BOT：${bot}\n`,
      `来自：${group}\n`,
      `时间：${time}`,
    ];

    const msg = await common.makeForwardMsg(e,text,"点击查看消息");

    await Bot[Bot_id].pickFriend(Master_id).sendMsg(Info)
      .then(() => Bot[Bot_id].pickFriend(Master_id).sendMsg(msg))
      .then(() => e.reply(`✅ 消息已送达\n主人的QQ：${Master_id}`))
      .then(() => redis.set(key, '1', { EX: cd }))
      .catch(err => e.reply(`❎ 消息发送失败`));
    /*
    await delay(1500)
    await Bot[Bot_id].pickFriend(Master_id).sendMsg(msg);
    */
  }
}