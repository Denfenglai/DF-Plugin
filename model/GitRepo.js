import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { Path } from "../components/index.js"

/**
 * 插件目录路径
 * @type {string}
 */
const pluginsDir = `${Path}/plugins`

/**
 * 获取本地插件远程地址
 * @returns {Promise<object>} result 插件远程路径，包含 GitHub 和 Gitee 仓库
 */
export async function PluginDirs() {
  /**
   * 存储 GitHub 和 Gitee 仓库路径的对象
   * @type {object}
   * @property {string[]} github - 存储 GitHub 仓库路径
   * @property {string[]} gitee - 存储 Gitee 仓库路径
   */
  const result = { github: [], gitee: [] }

  const subdirs = fs.readdirSync(pluginsDir)
  for (const subdir of subdirs) {
    const subdirPath = path.join(pluginsDir, subdir)
    if (fs.statSync(subdirPath).isDirectory() && isGitRepo(subdirPath)) {
      const remoteUrl = await getRemoteUrl(subdirPath)
      const branch = await getRemoteBranch(subdirPath)
      if (remoteUrl) classifyRepo(remoteUrl, branch, result)
    }
  }
  return result
}

/**
 * 检查是否为 Git 仓库
 * @param {string} dir - 检查的目录路径
 * @returns {boolean} 是否为 Git 仓库
 */
function isGitRepo(dir) {
  const gitDir = path.join(dir, ".git")
  return fs.existsSync(gitDir)
}

/**
 * 获取仓库的远程 URL
 * @param {string} repoPath - 仓库路径
 * @returns {Promise<string>} 仓库的远程 URL
 */
async function getRemoteUrl(repoPath) {
  const remoteUrl = await executeCommand("git remote get-url origin", repoPath)
  return remoteUrl
}

/**
 * 获取仓库当前分支
 * @param {string} repoPath - 仓库路径
 * @returns {Promise<string>} 当前分支名称
 */
async function getRemoteBranch(repoPath) {
  const branch = await executeCommand("git rev-parse --abbrev-ref HEAD", repoPath)
  return branch
}

/**
 * 根据远程 URL 对仓库进行分类，并将其添加到结果对象中
 * @param {string} url - 仓库的远程 URL
 * @param {string} branch - 当前分支名称
 * @param {object} result - 存储 GitHub 和 Gitee 仓库的对象
 */
function classifyRepo(url, branch, result) {
  if (url.includes("github.com")) {
    const parts = url.split("github.com/")
    if (parts[1]) {
      const repoPath = parts[1].replace(/\.git$/, "") + `:${branch}`
      result.github.push(repoPath)
    }
  } else if (url.includes("gitee.com")) {
    const parts = url.split("gitee.com/")
    if (parts[1]) {
      const repoPath = parts[1].replace(/\.git$/, "")
      result.gitee.push(repoPath + `:${branch}`)
    }
  }
}

/**
 * 在指定的路径下执行命令
 * @param {string} command - 要执行的命令
 * @param {string} cwd - 要在其下执行命令的当前工作目录
 * @returns {Promise<string>} 命令执行结果的输出
 */
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
