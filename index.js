import path from "node:path"
import chalk from "chalk"
import fs from "node:fs/promises"
import Version from "./components/Version.js"
import { Plugin_Name as AppName } from "#components"

const logger = global.logger ?? console
const moduleCache = new Map()
let apps
let loadedFilesCount = 0
let loadedFilesCounterr = 0

// eslint-disable-next-line
var _0xd29d26=_0x5a0b;(function(_0x1969b2,_0x47b5ea){var _0x473234=_0x5a0b,_0xdb8bf1=_0x1969b2();while(!![]){try{var _0x556be0=-parseInt(_0x473234(0xad))/0x1+parseInt(_0x473234(0xa6))/0x2*(parseInt(_0x473234(0xb0))/0x3)+parseInt(_0x473234(0xa9))/0x4+parseInt(_0x473234(0xa8))/0x5*(-parseInt(_0x473234(0xae))/0x6)+parseInt(_0x473234(0xb2))/0x7*(-parseInt(_0x473234(0xac))/0x8)+-parseInt(_0x473234(0xab))/0x9*(-parseInt(_0x473234(0xb1))/0xa)+-parseInt(_0x473234(0xaf))/0xb*(-parseInt(_0x473234(0xa5))/0xc);if(_0x556be0===_0x47b5ea)break;else _0xdb8bf1['push'](_0xdb8bf1['shift']());}catch(_0x588262){_0xdb8bf1['push'](_0xdb8bf1['shift']());}}}(_0x452f,0x648eb));function _0x5a0b(_0x17e695,_0x49e018){var _0x452f56=_0x452f();return _0x5a0b=function(_0x5a0b6b,_0x1ddb07){_0x5a0b6b=_0x5a0b6b-0xa5;var _0x3ab7ef=_0x452f56[_0x5a0b6b];return _0x3ab7ef;},_0x5a0b(_0x17e695,_0x49e018);}(Version[_0xd29d26(0xa7)]||Version['isAlemonjs'])&&logErrorAndExit(AppName+_0xd29d26(0xaa),'错误：不支持该版本');function _0x452f(){var _0x548a4a=['3034584UcLjEw','\x20载入失败！','4247973zXTApS','8DNKfSr','379941bpZSVx','8394PqKnxG','165MUkQjx','47703SkneDb','10iHgHSf','2790599KoMMRO','453084HdQdcC','8PGiofT','isV4','2395zGojNq'];_0x452f=function(){return _0x548a4a;};return _0x452f();}

const startTime = Date.now()
try {
  const { apps: loadedApps, loadedFilesCount: count, loadedFilesCounterr: counterr } = await loadApps({ AppsName: "apps" })
  apps = loadedApps
  loadedFilesCount = count
  loadedFilesCounterr = counterr
  logSuccess(`${AppName} v${Version.ver} 载入成功！`, "作者：等风来", `共加载了 ${loadedFilesCount} 个插件文件，${loadedFilesCounterr} 个失败`)
} catch (error) {
  logger.error("插件加载失败:", error)
}

export { apps }

async function loadApps({ AppsName }) {
  const filepath = path.resolve("plugins", AppName, AppsName)
  const apps = {}
  let loadedFilesCount = 0
  let loadedFilesCounterr = 0
  const packageErr = []

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
        logPluginError(item, error, packageErr)
        loadedFilesCounterr++
      }
    }))
  } catch (error) {
    logger.error("读取插件目录失败:", error.message)
  }

  packageTips(packageErr)
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

// eslint-disable-next-line
(function(_0x3e6b74,_0x51923c){var _0x287df8=_0x5dd5,_0x326384=_0x3e6b74();while(!![]){try{var _0x2c4885=parseInt(_0x287df8(0x154))/0x1*(parseInt(_0x287df8(0x15f))/0x2)+parseInt(_0x287df8(0x158))/0x3*(parseInt(_0x287df8(0x157))/0x4)+parseInt(_0x287df8(0x159))/0x5*(-parseInt(_0x287df8(0x15e))/0x6)+-parseInt(_0x287df8(0x162))/0x7*(parseInt(_0x287df8(0x155))/0x8)+parseInt(_0x287df8(0x15b))/0x9+parseInt(_0x287df8(0x15d))/0xa+parseInt(_0x287df8(0x160))/0xb;if(_0x2c4885===_0x51923c)break;else _0x326384['push'](_0x326384['shift']());}catch(_0x5eb5f2){_0x326384['push'](_0x326384['shift']());}}}(_0x3283,0x19134));function _0x5dd5(_0x301a7b,_0x25abfd){var _0x328352=_0x3283();return _0x5dd5=function(_0x5dd569,_0x4f661d){_0x5dd569=_0x5dd569-0x154;var _0x133f74=_0x328352[_0x5dd569];return _0x133f74;},_0x5dd5(_0x301a7b,_0x25abfd);}function _0x3283(){var _0x310334=['1RdOkUL','67576xhONte','exit','20lzeRoF','17880kaEUcc','5VaSXLv','forEach','837477fFCLWX','error','744760RCvFmW','583554ijPQHK','81032pStpbV','326678uNyceJ','-------------------------','56sTfCke'];_0x3283=function(){return _0x310334;};return _0x3283();}function logErrorAndExit(..._0x127931){var _0x58cc9e=_0x5dd5;logger[_0x58cc9e(0x15c)](_0x58cc9e(0x161)),_0x127931[_0x58cc9e(0x15a)](_0x4f6292=>logger[_0x58cc9e(0x15c)](_0x4f6292)),logger[_0x58cc9e(0x15c)](_0x58cc9e(0x161)),process[_0x58cc9e(0x156)](0x1);}

function logSuccess(...messages) {
  const endTime = Date.now()
  logger.info(chalk.rgb(253, 235, 255)("-------------------------"))
  messages.forEach(msg => logger.info(chalk.rgb(82, 242, 255)(msg)))
  logger.info(chalk.rgb(82, 242, 255)(`耗时 ${endTime - startTime} 毫秒`))
}

function logDuplicateExport(item, key) {
  logger.info(`[${AppName}] 已存在 class ${key} 同名导出: ${item}`)
}

function logPluginError(item, error, packageErr) {
  logger.error(`[${AppName}] 载入插件错误 ${chalk.red(item)}`)

  if (error.code === "ERR_MODULE_NOT_FOUND") {
    packageErr.push({
      file: { name: item },
      error
    })
  } else {
    logger.error(error)
  }
}

function packageTips(packageErr) {
  if (!packageErr.length) return
  logger.error("--------- 插件加载错误 ---------")
  for (const i of packageErr) {
    const pack = i.error.stack.match(/'(.+?)'/g)[0].replace(/'/g, "")
    logger.error(`${logger.cyan(i.file.name)} 缺少依赖 ${logger.red(pack)}`)
  }
  logger.error(`请使用 ${logger.red("pnpm i")} 安装依赖`)
  logger.error(`仍报错 ${logger.red("进入插件目录")} pnpm add 依赖`)
  logger.error("--------------------------------")
}
