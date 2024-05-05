import fetch from "node-fetch"
import { Config } from "../components/index.js"

export class Chuo extends plugin{
    constructor(){
    super({
        name: '柴郡戳一戳',
        dsc: '戳一戳机器人发送柴郡表情包',
        event: 'notice.group.poke',
        priority: 114,
        rule: [{ fnc: 'chuo' }]
        }
    )
}

async chuo (e){
    if ( !Config.other.chuo ) return false
    if ( e.target_id == e.self_id ) {
        let Num = Math.floor(Math.random() * 161) + 1;
        let url = `https://i.dengfenglai.icu/柴郡猫/${Num}.png`
        logger.debug(`[DF：柴郡戳一戳] 开始图片任务: ${url} `)
        await e.reply(segment.image(`${url}`));
      }
    }
}