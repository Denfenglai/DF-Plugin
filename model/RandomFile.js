import fs from "fs"
import _ from "lodash"
import path from "path"
import { Poke_Path } from "../components/index.js"
/**
 * 随机获取一个文件
 * @param {string} dirPath - 文件夹路径
 * @returns {string|null} path - 文件路径或空
 */
function randomFile(dirPath) {
  try {
    const files = fs.readdirSync(dirPath)
    if (files.length === 0) {
      logger.error(`[DF-Plugin] 获取文件失败: ${dirPath}`)
      return null
    }
    const fileName = _.sample(files)
    return path.join(dirPath, fileName)
  } catch (err) {
    logger.error(`[DF-Plugin] 获取文件错误: ${dirPath}\n${err}`)
    return null
  }
}

/**
 * 抽取随机表情包
 * @param {string} name - 表情包名称
 * @returns {string|null} 文件路径或api地址
 */
function imagePoke(name) {
  const Path = Poke_Path + name
  if (!fs.existsSync(Path)) return `https://yugan.love/?name=${name}`
  return randomFile(Path)
}

export { randomFile, imagePoke }
