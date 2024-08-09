import fs from "node:fs"
import { exec } from "node:child_process"
import { imagePoke } from "../model/index.js"
import { Config, Plugin_Path, Poke_List, Poke_Path } from "../components/index.js"

if (!fs.existsSync(Poke_Path) && Config.other.chuo) logger.warn("[DF-Plugin] 检测到未安装戳一戳图库 将调用XY-Api返回图片")

export class Poke extends plugin {
  constructor() {
    super({
      name: "DF:戳一戳",
      dsc: "戳一戳机器人发送随机表情包",
      event: "notice.group.poke",
      priority: -114,
      rule: [ { fnc: "poke" } ]
    })
  }

  async poke() {
    const { chuo, chuoType } = Config.other
    if (!chuo) return false
    if (this.e.target_id != this.e.self_id) return false
    const name = Poke_List[chuoType]
    const file = imagePoke(name)
    if (!file) return false
    return this.e.reply(segment.image(file))
  }
}

export class updateImg extends plugin {
  constructor() {
    super({
      name: "DF:更新图库",
      dsc: "更新戳一戳图库",
      event: "message",
      priority: 514,
      rule: [
        {
          reg: "^#?DF(安装|更新)(戳一戳)?图库$",
          fnc: "up_img"
        }
      ]
    })
  }

  /**
   * 更新和安装图库
   * @param {object} e 消息事件
   */
  async up_img(e) {
    if (!e.isMaster) return false
    if (fs.existsSync(Poke_Path)) {
      e.reply("正在更新，请主人稍安勿躁~")
      exec("git pull", { cwd: Poke_Path }, (error, stdout) => {
        if (/Already up to date/.test(stdout) || stdout.includes("最新")) return e.reply("目前所有图片都已经是最新了~")
        let numRet = /(\d*) files changed,/.exec(stdout)
        if (numRet && numRet[1]) e.reply(`更新成功，共更新了${numRet[1]}张图片~`)
        if (error) {
          e.reply(`图片资源更新失败！\nError code: ${error.code}\n${error.stack}\n 请稍后重试。`)
        } else {
          e.reply("戳一戳图片资源更新完毕")
        }
      })
    } else {
      let command = "git clone  --depth=1 https://gitee.com/DenFengLai/poke ./resources/poke"
      e.reply("开始安装戳一戳图库,可能需要一段时间,请主人稍安勿躁~")
      exec(command, { cwd: Plugin_Path }, (error) => {
        if (error) {
          e.reply(`戳一戳图库安装失败！\nError code: ${error.code}\n${error.stack}\n 请稍后重试。`)
        } else {
          e.reply("戳一戳图库安装成功！您后续也可以通过 #DF更新图库 命令来更新图片")
        }
      })
    }
  }
}
