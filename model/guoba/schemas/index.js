import CodeUpdata from "./CodeUpdata.js"
import Picture from "./Picture.js"
import Poke from "./Poke.js"
import other from "./other.js"
import sendMaster from "./SendMaster.js"
import summary from "./Summary.js"
import { Config } from "#components"

export const schemas = [
  ...sendMaster,
  ...Poke,
  ...CodeUpdata,
  ...Picture,
  ...summary,
  ...other
]

export function getConfigData() {
  return {
    other: Config.other,
    sendMaster: Config.sendMaster,
    CodeUpdate: Config.CodeUpdate,
    summary: Config.summary,
    Picture: Config.Picture
  }
}

export function setConfigData(data, { Result }) {
  for (let key in data) {
    Config.modify(...key.split("."), data[key])
  }
  return Result.ok({}, "Ciallo～(∠・ω< )⌒☆")
}
