import path from "path"
import chalk from "chalk"
import fs from "fs/promises"
import Version from "./components/Version.js"

const AppName = "DF-Plugin"
const logger = global.logger ?? console
const moduleCache = new Map()
let apps
let loadedFilesCount = 0
let loadedFilesCounterr = 0

if (Version.isV4 || Version.isAlemonjs) {
  logErrorAndExit(`${AppName} 载入失败！`, "错误：不支持该版本")
}

const startTime = Date.now()
try {
  const { apps: loadedApps, loadedFilesCount: count, loadedFilesCounterr: counterr } = await loadApps({ AppsName: "apps" })
  apps = loadedApps
  loadedFilesCount = count
  loadedFilesCounterr = counterr
  logSuccess(`${AppName} ${Version.ver} 载入成功！`, "作者：等风来", `共加载了 ${loadedFilesCount} 个插件文件，${loadedFilesCounterr} 个失败`)
} catch (error) {
  logger.error("插件加载失败:", error)
}

export { apps }

async function loadApps({ AppsName }) {
  const filepath = path.resolve("plugins", AppName, AppsName)
  const apps = {}
  let loadedFilesCount = 0
  let loadedFilesCounterr = 0

  try {
    const jsFilePaths = await traverseDirectory(filepath)
    await Promise.all(jsFilePaths.map(async(item) => {
      try {
        const allExport = moduleCache.get(item) ?? await import(`file://${item}`)
        moduleCache.set(item, allExport)

        for (const [ key, value ] of Object.entries(allExport)) {
          if (typeof value === "function" && value.prototype) {
            if (!apps[key]) {
              apps[key] = value
              loadedFilesCount++
            } else {
              logDuplicateExport(item, key)
              loadedFilesCounterr++
            }
          }
        }
      } catch (error) {
        logPluginError(item, error)
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
    for (const file of files) {
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

function logErrorAndExit(...messages) {
  logger.error("-------------------------")
  messages.forEach(msg => logger.error(msg))
  logger.error("-------------------------")
  process.exit(1)
}

function logSuccess(...messages) {
  const endTime = Date.now()
  logger.info(chalk.rgb(253, 235, 255)("-------------------------"))
  messages.forEach(msg => logger.info(chalk.rgb(82, 242, 255)(msg)))
  logger.info(chalk.rgb(82, 242, 255)(`耗时 ${endTime - startTime} 毫秒`))
}

function logDuplicateExport(item, key) {
  logger.info(`[${AppName}] 已存在 class ${key} 同名导出: ${item}`)
}

function logPluginError(item, error) {
  logger.error(`[${AppName}] 载入插件错误 ${chalk.red(item)}`)
  logger.error(error)
}
