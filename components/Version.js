import fs from "node:fs"
import lodash from "lodash"
import { Data, Plugin_Path } from "./index.js"
const README_path = `${Plugin_Path}/README.md`
const CHANGELOG_path = `${Plugin_Path}/CHANGELOG.md`
let packageJson = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`, "utf8"))
// let yunzai_ver = packageJson.version

let logs = {}
let changelogs = []
let currentVersion
let versionCount = 3

const getLine = function(line) {
  line = line.replace(/(^\s*\*|\r)/g, "")
  line = line.replace(/\s*`([^`]+`)/g, "<span class=\"cmd\">$1")
  line = line.replace(/`\s*/g, "</span>")
  line = line.replace(/\s*\*\*([^*]+\*\*)/g, "<span class=\"strong\">$1")
  line = line.replace(/\*\*\s*/g, "</span>")
  line = line.replace(/ⁿᵉʷ/g, "<span class=\"new\"></span>")
  return line
}

const readLogFile = function(root, versionCount = 4) {
  root = Data.getRoot(root)
  let logPath = `${root}/CHANGELOG.md`
  let logs = {}
  let changelogs = []
  let currentVersion

  try {
    if (fs.existsSync(logPath)) {
      logs = fs.readFileSync(logPath, "utf8") || ""
      logs = logs.split("\n")

      let temp = {}
      let lastLine = {}
      lodash.forEach(logs, (line) => {
        if (versionCount <= -1) {
          return false
        }
        let versionRet = /^#\s*([0-9a-zA-Z\\.~\s]+?)\s*$/.exec(line)
        if (versionRet && versionRet[1]) {
          let v = versionRet[1].trim()
          if (!currentVersion) {
            currentVersion = v
          } else {
            changelogs.push(temp)
            if (/0\s*$/.test(v) && versionCount > 0) {
              versionCount = 0
            } else {
              versionCount--
            }
          }

          temp = {
            version: v,
            logs: []
          }
        } else {
          if (!line.trim()) {
            return
          }
          if (/^\*/.test(line)) {
            lastLine = {
              title: getLine(line),
              logs: []
            }
            temp.logs.push(lastLine)
          } else if (/^\s{2,}\*/.test(line)) {
            lastLine.logs.push(getLine(line))
          }
        }
      })
    }
  } catch (e) {
    // do nth
  }
  return { changelogs, currentVersion }
}

try {
  if (fs.existsSync(CHANGELOG_path)) {
    logs = fs.readFileSync(CHANGELOG_path, "utf8") || ""
    logs = logs.replace(/\t/g, "   ").split("\n")
    let temp = {}
    let lastLine = {}
    lodash.forEach(logs, (line) => {
      if (versionCount < 1) {
        return false
      }
      let versionRet = /^#\s*([0-9a-zA-Z\\.~\s]+?)\s*$/.exec(line.trim())
      if (versionRet && versionRet[1]) {
        let v = versionRet[1].trim()
        if (!currentVersion) {
          currentVersion = v
        } else {
          changelogs.push(temp)
          if (/0\s*$/.test(v) && versionCount > 0) {
            // versionCount = 0
            versionCount--
          } else {
            versionCount--
          }
        }
        temp = {
          version: v,
          logs: []
        }
      } else {
        if (!line.trim()) {
          return
        }
        if (/^\*/.test(line)) {
          lastLine = {
            title: getLine(line),
            logs: []
          }
          if (!temp.logs) {
            temp = {
              version: line,
              logs: []
            }
          }
          temp.logs.push(lastLine)
        } else if (/^\s{2,}\*/.test(line)) {
          lastLine.logs.push(getLine(line))
        }
      }
    })
  }
} catch (e) {
  logger.error(e)
  // do nth
}

try {
  if (fs.existsSync(README_path)) {
    let README = fs.readFileSync(README_path, "utf8") || ""
    let reg = /版本：(.*)/.exec(README)
    if (reg) {
      currentVersion = reg[1]
    }
  }
} catch (err) {}

try {
  const packagePath = `${Plugin_Path}/package.json`
  const packageData = JSON.parse(fs.readFileSync(packagePath, "utf8"))

  if (packageData.version !== currentVersion) {
    console.log(`[DF-Plugin] 版本号不一致，更新版本号为: ${currentVersion}`)
    packageData.version = currentVersion

    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), "utf8")
    console.log("[DF-Plugin] package.json 已更新")
  }
} catch (error) {
  console.error("读取或解析 package.json 出现错误:", error)
}

const yunzaiVersion = packageJson.version
const isV3 = yunzaiVersion[0] === "3"
const isV4 = yunzaiVersion[0] === "4"
let isMiao = false
let isTRSS = false
let isAlemonjs = false
let name = "Yunzai-Bot"
if (packageJson.name === "miao-yunzai") {
  isMiao = true
  name = "Miao-Yunzai"
} else if (packageJson.name === "trss-yunzai") {
  isTRSS = true
  name = "TRSS-Yunzai"
} else if (packageJson.name === "a-yunzai") {
  name = "A-Yunzai"
  isAlemonjs = true
}

let Version = {
  isV3,
  isV4,
  isMiao,
  isTRSS,
  name,
  isAlemonjs,
  get version() {
    return currentVersion
  },
  get yunzai() {
    return yunzaiVersion
  },
  get logs() {
    return changelogs
  },
  get ver() {
    return currentVersion
  },
  readLogFile
}

export default Version
