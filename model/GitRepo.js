import fs from "fs"
import path from "path"
import { Path } from "../components/index.js"
import { exec } from "child_process"

const pluginsDir = `${Path}/plugins`
const result = { github: [], gitee: [] }

/**
 * 获取本地插件远程地址
 * @returns {object} result 插件远程路径
 */
export async function PluginDirs() {
  const subdirs = fs.readdirSync(pluginsDir)
  // 这一块待优化有一些没必要的判断
  for (const subdir of subdirs) {
    const subdirPath = path.join(pluginsDir, subdir)
    if (fs.statSync(subdirPath).isDirectory() && isGitRepo(subdirPath)) {
      // const gitConfigPath = path.join(subdirPath, ".git", "config")
      if (fs.existsSync(subdirPath)) {
        const remoteUrl = await getRemoteUrl(subdirPath)
        const branch = await getRemoteBranch(subdirPath)
        if (remoteUrl) classifyRepo(remoteUrl, branch)
      }
    }
  }

  // subdirs.forEach(async subdir => {
  //   const subdirPath = path.join(pluginsDir, subdir)
  //   if (fs.statSync(subdirPath).isDirectory() && isGitRepo(subdirPath)) {
  //     const gitConfigPath = path.join(subdirPath, ".git", "config")
  //     if (fs.existsSync(gitConfigPath)) {
  //       const remoteUrl = await getRemoteUrl(gitConfigPath)
  //       if (remoteUrl) classifyRepo(remoteUrl)
  //     }
  //   }
  // })

  return result
}

function isGitRepo(dir) {
  const gitDir = path.join(dir, ".git")
  return fs.existsSync(gitDir)
}

async function getRemoteUrl(repoPath) {
  // const configContent = fs.readFileSync(gitConfigPath, "utf-8")
  // const match = configContent.match(/\[remote "origin"\][\s\S]*?url = (.+)/)
  const remoteUrl = await executeCommand("git remote get-url origin", repoPath)
  return remoteUrl
}

async function getRemoteBranch(repoPath) {
  const branch = await executeCommand("git rev-parse --abbrev-ref HEAD", repoPath)
  return branch
}

function classifyRepo(url, branch) {
  if (url.includes("github.com")) {
    const parts = url.split("github.com/")
    if (parts[1]) {
      const repoPath = parts[1].replace(/\.git$/, "")
      result.github.push(repoPath + `:${branch}`)
    }
  } else if (url.includes("gitee.com")) {
    const parts = url.split("gitee.com/")
    if (parts[1]) {
      const repoPath = parts[1].replace(/\.git$/, "")
      result.gitee.push(repoPath + `:${branch}`)
    }
  }
}
async function executeCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout.trim())
      }
    })
  })
}
