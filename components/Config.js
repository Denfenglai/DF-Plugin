import YAML from "yaml"
import cfg from "../../../lib/config/config.js"
import makeConfig from "../../../lib/plugins/config.js"
import fs from "node:fs/promises"
import { Plugin_Name, Plugin_Path } from "../constants/Path.js"
import _ from "lodash"

export class Config {
  plugin_name = Plugin_Name
  plugin_path = Plugin_Path
  /** 初始化配置 */
  async initCfg() {
    this.config = YAML.parse(await fs.readFile(`${this.plugin_path}/config/system/config.yaml`, "utf8"))

    /** 导入旧配置文件 */
    const path = `${this.plugin_path}/config/config`
    if (await fs.stat(path).catch(() => false)) {
      for (let file of (await fs.readdir(path)).filter(file => file.endsWith(".yaml"))) {
        const key = file.replace(".yaml", "")
        if (!(key in this.config)) continue
        _.merge(this.config[key], YAML.parse(await fs.readFile(`${path}/${file}`, "utf8")))
      }
      await fs.rename(path, `${path}_old`)
    }

    /** 保留注释 */
    const keep = {}
    for (const i in this.config) {
      keep[i] = {}
      for (const j in this.config[i]) {
        if (j.endsWith("Tips")) { keep[i][j] = this.config[i][j] }
      }
    }

    const { config, configSave } = await makeConfig(this.plugin_name, this.config, keep, {
      replacer: i => i.replace(/(\n.+?Tips:)/g, "\n$1"),
    })
    this.config = config
    this.configSave = configSave
    return this
  }

  /** 主人列表 */
  get masterQQ() {
    return cfg.masterQQ
  }

  /** TRSS的主人列表 */
  get master() {
    return cfg.master
  }

  /** 联系主人 */
  get sendMaster() {
    return this.config.sendMaster
  }

  /** 其他配置 */
  get other() {
    return this.config.other
  }

  /** Git推送 */
  get CodeUpdate() {
    return this.config.CodeUpdate
  }

  /** 图片外显 */
  get summary() {
    return this.config.summary
  }

  /** 随机图片配置 */
  get Picture() {
    return this.config.Picture
  }

  /**
   * 群配置
   * @param group_id
   * @param bot_id
   */
  getGroup(group_id = "", bot_id = "") {
    return Array.isArray(Bot.uin) ? cfg.getGroup(bot_id, group_id) : cfg.getGroup(group_id)
  }

  /**
   * 修改设置
   * @param {string} name 配置名
   * @param {string} key 修改的key值
   * @param {string | number} value 修改的value值
   */
  modify(name, key, value) {
    if (typeof this.config[name] != "object") { this.config[name] = {} }
    this.config[name][key] = value
    return this.configSave()
  }

  /**
   * 修改配置数组
   * @param {string} name 文件名
   * @param {string | number} key key值
   * @param {string | number} value value
   * @param {'add'|'del'} category 类别 add or del
   */
  modifyarr(name, key, value, category = "add") {
    if (typeof this.config[name] != "object") this.config[name] = {}
    if (!Array.isArray(this.config[name][key])) this.config[name][key] = []
    if (category == "add") {
      if (!this.config[name][key].includes(value)) this.config[name][key].push(value)
    } else {
      this.config[name][key] = this.config[name][key].filter(item => item !== value)
    }
    return this.configSave()
  }
}

export default await new Config().initCfg()
