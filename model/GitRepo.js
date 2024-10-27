import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { Path } from "../components/index.js"

/**
 * 获取所有包含 .git 的目录
 * @returns {Promise<object>} result 插件远程路径，包含 GitHub 和 Gitee 仓库
 */
export async function PluginDirs() {
  const result = { github: [], gitee: [] }
  await traverseDirectories(Path, result)
  return result
}

/**
 * 递归遍历目录以查找包含 .git 的 Git 仓库
 * @param {string} dir - 当前遍历的目录路径
 * @param {object} result - 存储 GitHub 和 Gitee 仓库的对象
 */
async function traverseDirectories(dir, result) {
  const items = fs.readdirSync(dir)
  for (const item of items) try {
    if (item === "data" || item === "node_modules") continue // 排除指定目录

    const itemPath = path.join(dir, item)
    if (fs.statSync(itemPath).isDirectory()) {
      if (isGitRepo(itemPath)) {
        const branch = await getRemoteBranch(itemPath)
        const remoteUrl = await getRemoteUrl(itemPath, branch)
        if (remoteUrl) classifyRepo(remoteUrl, branch, result)
      } else {
        await traverseDirectories(itemPath, result)
      }
    }
  } catch (err) {
    console.error(`无法读取目录: ${dir}/${item}`, err)
  }
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
 * 获取仓库分支远程 URL
 * @param {string} repoPath - 仓库路径
 * @param {string} branch - 分支名称
 * @returns {Promise<string>} 仓库的远程 URL
 */
async function getRemoteUrl(repoPath, branch) {
  return executeCommand(`git remote get-url ${await getRemoteName(repoPath, branch)}`, repoPath)
}

/**
 * 获取仓库分支远程名称
 * @param {string} repoPath - 仓库路径
 * @param {string} branch - 分支名称
 * @returns {Promise<string>} 当前分支名称
 */
function getRemoteName(repoPath, branch) {
  return executeCommand(`git config branch.${branch}.remote`, repoPath)
}

/**
 * 获取仓库当前分支
 * @param {string} repoPath - 仓库路径
 * @returns {Promise<string>} 当前分支名称
 */
function getRemoteBranch(repoPath) {
  return executeCommand("git branch --show-current", repoPath)
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
      const repoPath = parts[1].replace(/(\/|\.git)$/, "") + `:${branch}`
      result.github.push(repoPath)
    }
  } else if (url.includes("gitee.com")) {
    const parts = url.split("gitee.com/")
    if (parts[1]) {
      const repoPath = parts[1].replace(/(\/|\.git)$/, "") + `:${branch}`
      result.gitee.push(repoPath)
    }
  }
}

/**
 * 在指定的路径下执行命令
 * @param {string} command - 要执行的命令
 * @param {string} cwd - 要在其下执行命令的当前工作目录
 * @returns {Promise<string>} 命令执行结果的输出
 */
function executeCommand(command, cwd) {
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
