import path from "path"
import chalk from "chalk"
import fs from "fs/promises"
import Version from "./components/Version.js"

let AppName = "DF-Plugin"
const logger = global.logger ?? console
const moduleCache = new Map()
let loadedFilesCount = 0
let loadedFilesCounterr = 0
let apps

if (Version.isV4 || Version.isAlemonjs) {
  logger.error("-------------------------")
  logger.error(`${AppName} 载入失败！`)
  logger.error("错误：不支持该版本")
  logger.error("-------------------------")
  process.exit(1)
}
const startTime = Date.now()
const { apps: loadedApps, loadedFilesCount: count, loadedFilesCounterr: counterr } = await appsOut({ AppsName: "apps" })
const endTime = Date.now()
apps = loadedApps
loadedFilesCount = count
loadedFilesCounterr = counterr
logger.info(chalk.rgb(253, 235, 255)("-------------------------"))
logger.info(chalk.rgb(82, 242, 255)(`${AppName} 载入成功！`))
logger.info(chalk.rgb(82, 242, 255)("作者：等风来"))
logger.info(chalk.rgb(82, 242, 255)(`共加载了 ${loadedFilesCount} 个插件文件 ${loadedFilesCounterr} 个失败`))
logger.info(chalk.rgb(82, 242, 255)(`耗时 ${endTime - startTime} 毫秒`))
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
              logger.info(`[${AppName}] 已存在 class ${key} 同名导出: ${item}`)
              loadedFilesCounterr++
            }
          }
        }
      } catch (error) {
        logger.error(`[${AppName}n] 载入插件错误 ${logger.red(item)}`)
        logger.error(error)
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
