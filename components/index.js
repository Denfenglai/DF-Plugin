import Data from "./Data.js"
import Config from "./Config.js"
import YamlReader from "./YamlReader.js"
import Version from "./Version.js"
import Common from "../lib/common/common.js"
import render from "../lib//puppeteer/render.js"

const Path = process.cwd()
const Plugin_Name = "DF-Plugin"
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`
const Poke_Path = `${Plugin_Path}/resources/poke`

const Poke_List = [
  "default",
  "柴郡猫",
  "丛雨",
  "诗歌剧",
  "千恋万花",
  "小南梁",
  "古拉",
  "甘城猫猫",
  "龙图",
  "满穗",
  "猫猫虫",
  "纳西妲",
  "心海",
  "fufu"
]

export { Config, Data, Path, Plugin_Name, Plugin_Path, YamlReader, render, Version, Common, Poke_List, Poke_Path }
