import fs from "fs"
import _ from "lodash"
import path from "path"

/**
 * 随机获取一个文件
 * @param dirPath - 文件夹路径
 * @returns {string|null} path - 文件路径或空
 */
export function randomFile(dirPath) {
  try {
    const files = fs.readdirSync(dirPath)
    if (files.length === 0) {
      logger.error(`[DF-Plugin] 获取文件失败: ${dirPath}`)
      return null
    }
    const fileName = _.sample(files)
    return path.join(dirPath, fileName)
  } catch (err) {
    throw new Error(`[DF]获取文件错误: ${dirPath}\n${err}`)
  }
}
