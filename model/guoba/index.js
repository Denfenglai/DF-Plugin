import { schemas, getConfigData, setConfigData } from "./schemas/index.js"
import pluginInfo from "./pluginInfo.js"

export function supportGuoba() {
  return {
    pluginInfo,
    configInfo: {
      schemas,
      getConfigData,
      setConfigData
    }
  }
}
