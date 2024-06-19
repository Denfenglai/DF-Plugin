import { Config } from "../components/index.js"
import common from "../../../lib/common/common.js"

/**
 * 发送主人消息
 * @param msg
 * @param botUin
 */
async function sendMasterMsg(msg, botUin = Bot.uin) {
  /** 获取配置信息 */
  const Master = Config.sendMaster.Master
  let masterQQ = Config.masterQQ
  /** 处理喵崽 */
  if (Config.master) {
    const master = Config.master[botUin]
    if (master?.length) masterQQ = master
    else botUin = undefined
  }
  /** 发送全部主人 */
  if (Master === 1) {
    /** TRSS发全部主人函数 */
    if (Bot?.sendMasterMsg) {
      await Bot.sendMasterMsg(msg, Bot.uin, 2000)
    } else {
      /** 遍历发送主人 */
      for (const i of masterQQ) {
        await common.relpyPrivate(i, msg, botUin)
        await common.sleep(2000)
      }
    }
    /** 发送首位主人 */
  } else if (Master === 0) {
    await common.relpyPrivate(masterQQ[0], msg, botUin)
    /** 发送指定主人 */
  } else {
    await common.relpyPrivate(Master, msg, botUin)
  }
}

export { sendMasterMsg }
