import fs from "fs"
import _ from "lodash"
import path from "path"

/**
 * 随机获取一个文件
 * @param dirPath - 文件夹路径
 * @returns 文件路径或false
 */
export function randomFile(dirPath) {
  try {
    const files = fs.readdirSync(dirPath)
    if (files.length === 0) {
      throw new Error("在目录中找不到文件")
    }
    const fileName = _.sample(files)
    return path.join(dirPath, fileName)
  } catch (err) {
    logger.error(`[DF]获取文件错误: ${dirPath}\n${err}`)
    return false
  }
}
