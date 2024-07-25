import Data from "./Data.js"
import Config from "./Config.js"
import YamlReader from "./YamlReader.js"
import Version from "./Version.js"
import Common from "./Common.js"
import render from "./common-lib/render.js"

const Path = process.cwd()
const Plugin_Name = "DF-Plugin"
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`

export { Config, Data, Path, Plugin_Name, Plugin_Path, YamlReader, render, Version, Common }
