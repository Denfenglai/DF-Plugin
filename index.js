import path from "path"
import chalk from "chalk"
import fs from "fs/promises"

let AppName = "DF-Plugin"
const logger = global.logger || console
const moduleCache = new Map()
let loadedFilesCount = 0
let loadedFilesCounterr = 0
let apps
global.ReplyError = class ReplyError extends Error {
  constructor(message) {
    super(message)
    this.name = "ReplyError"
  }
}

const startTime = Date.now()
logger.info("[DF-Plugin] 开始加载插件")
const { apps: loadedApps, loadedFilesCount: count, loadedFilesCounterr: counterr } = await appsOut({ AppsName: "apps" })
const endTime = Date.now()
apps = loadedApps
loadedFilesCount = count
loadedFilesCounterr = counterr
logger.info(chalk.rgb(253, 235, 255)("-------------------------"))
logger.info(chalk.rgb(134, 142, 204)("DF-Plugin载入成功！"))
logger.info(chalk.rgb(134, 142, 204)(`共加载了 ${loadedFilesCount} 个插件文件 ${loadedFilesCounterr} 个失败`))
logger.info(chalk.rgb(134, 142, 204)(`耗时 ${endTime - startTime} 毫秒`))
logger.info(chalk.rgb(253, 235, 255)("-------------------------"))
export { apps }
async function appsOut({ AppsName }) {
  const firstName = path.join("plugins", AppName)
  const filepath = path.resolve(firstName, AppsName)
  let loadedFilesCount = 0
  let loadedFilesCounterr = 0
  const apps = {}

  try {
    const jsFilePaths = await traverseDirectory(filepath)
    await Promise.all(jsFilePaths.map(async(item) => {
      try {
        const allExport = moduleCache.has(item)
          ? moduleCache.get(item)
          : await import(`file://${item}`)

        for (const key of Object.keys(allExport)) {
          if (typeof allExport[key] === "function" && allExport[key].prototype) {
            if (!Object.prototype.hasOwnProperty.call(apps, key)) {
              apps[key] = allExport[key]
              loadedFilesCount++
            } else {
              logger.info(`[DF-Plugin] 已存在 class ${key} 同名导出: ${item}`)
              loadedFilesCounterr++
            }
          }
        }
      } catch (error) {
        logger.error(`[DF-Plugin] 加载 ${item} 文件失败: ${error.message}`)
        loadedFilesCounterr++
      }
    }))
  } catch (error) {
    logger.error("读取插件目录失败:", error.message)
  }

  return { apps, loadedFilesCount, loadedFilesCounterr }
}

async function traverseDirectory(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true })
    const jsFiles = []
    for await (const file of files) {
      const pathname = path.join(dir, file.name)
      if (file.isDirectory()) {
        jsFiles.push(...await traverseDirectory(pathname))
      } else if (file.name.endsWith(".js")) {
        jsFiles.push(pathname)
      }
    }
    return jsFiles
  } catch (error) {
    logger.error("读取插件目录失败:", error.message)
    return []
  }
}
