import chalk from "chalk"
import Data from "./components/Data.js"
import fs from "fs"

logger.info(chalk.rgb(253, 235, 255)("-------------------------"))
logger.info(chalk.rgb(134, 142, 204)(`DF-Plugin载入成功！`))
logger.info(chalk.rgb(253, 235, 255)("-------------------------"))

global.ReplyError = class ReplyError extends Error {
  constructor(message) {
    super(message)
    this.name = "ReplyError"
  }
}

const appsPath = "./plugins/DF-Plugin/apps"
const jsFiles = Data.readDirRecursive(appsPath, "js", "events")

let ret = jsFiles.map(file => {
  return import(`./apps/${file}`)
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in jsFiles) {
  let name = jsFiles[i].replace(".js", "")

  if (ret[i].status != "fulfilled") {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

export { apps }