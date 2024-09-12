import fs from "node:fs"
import { exec } from "node:child_process"
import { update as Update } from "../../other/update.js"
import { Plugin_Name, Plugin_Path, Poke_Path } from "../components/index.js"

export class DFupdate extends plugin {
  constructor() {
    super({
      name: "DF:更新插件",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: "^#[Dd][Ff](插件)?(强制)?更新$",
          fnc: "update"
        },
        {
          reg: "^#[Dd][Ff](插件)?更新日志$",
          fnc: "updateLog"
        },
        {
          reg: "^#?[Dd][Ff](安装|更新)(戳一戳)?图库$",
          fnc: "up_img"
        }
      ]
    })
  }

  async update(e = this.e) {
    const Type = e.msg.includes("强制") ? "#强制更新" : "#更新"
    e.msg = Type + Plugin_Name
    const up = new Update(e)
    up.e = e
    return up.update()
  }

  async updateLog(e = this.e) {
    e.msg = "#更新日志" + Plugin_Name
    const up = new Update(e)
    up.e = e
    return up.updateLog()
  }

  async up_img(e) {
    if (!e.isMaster) return false
    if (fs.existsSync(Poke_Path)) {
      e.reply("正在更新，请主人稍安勿躁~")
      exec("git pull", { cwd: Poke_Path }, (error, stdout) => {
        if (/Already up to date/.test(stdout) || stdout.includes("最新")) return e.reply("目前所有图片都已经是最新了~")
        let numRet = /(\d*) files changed,/.exec(stdout)
        if (numRet && numRet[1]) {
          e.reply(`更新成功，共更新了${numRet[1]}张图片~`)
        } else if (error) {
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
