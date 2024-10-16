import fs from "fs"
import path from "path"
import { Path } from "../components/index.js"

const pluginsDir = `${Path}/plugins`
const result = { github: [], gitee: [] }

/**
 * 获取本地插件远程地址
 * @returns {object} result 插件远程路径
 */
export function PluginDirs() {
  const subdirs = fs.readdirSync(pluginsDir)

  subdirs.forEach(subdir => {
    const subdirPath = path.join(pluginsDir, subdir)
    if (fs.statSync(subdirPath).isDirectory() && isGitRepo(subdirPath)) {
      const gitConfigPath = path.join(subdirPath, ".git", "config")
      if (fs.existsSync(gitConfigPath)) {
        const remoteUrl = getRemoteUrl(gitConfigPath)
        if (remoteUrl) classifyRepo(remoteUrl)
      }
    }
  })

  return result
}

function isGitRepo(dir) {
  const gitDir = path.join(dir, ".git")
  return fs.existsSync(gitDir)
}

function getRemoteUrl(gitConfigPath) {
  const configContent = fs.readFileSync(gitConfigPath, "utf-8")
  const match = configContent.match(/\[remote "origin"\][\s\S]*?url = (.+)/)
  return match ? match[1] : null
}

function classifyRepo(url) {
  if (url.includes("github.com")) {
    const parts = url.split("github.com/")
    if (parts[1]) {
      const repoPath = parts[1].replace(/\.git$/, "")
      result.github.push(repoPath)
    }
  } else if (url.includes("gitee.com")) {
    const parts = url.split("gitee.com/")
    if (parts[1]) {
      const repoPath = parts[1].replace(/\.git$/, "")
      result.gitee.push(repoPath)
    }
  }
}
