import lodash from "lodash"
import fs from "fs"
import { Data, Plugin_Name } from "../../components/index.js"

const Theme = {
  async getThemeCfg(theme, exclude) {
    const dirPath = `./plugins/${Plugin_Name}/resources/help/theme/`
    const resPath = "{{_res_path}}/help/theme/"

    const names = fs.readdirSync(dirPath)
      .filter(dir => fs.existsSync(`${dirPath}${dir}/main.jpg`))

    let ret = []
    if (lodash.isArray(theme)) {
      ret = lodash.intersection(theme, names)
    } else if (theme === "all") {
      ret = names
    }

    if (exclude && lodash.isArray(exclude)) {
      ret = lodash.difference(ret, exclude)
    }

    if (ret.length === 0) {
      ret = [ "default" ]
    }

    const name = lodash.sample(ret)
    return {
      main: `${resPath}${name}/main.jpg`,
      bg: fs.existsSync(`${dirPath}${name}/bg.jpg`) ? `${resPath}${name}/bg.jpg` : `${resPath}default/bg.jpg`,
      style: (await Data.importModule(`resources/help/theme/${name}/config.js`)).style || {}
    }
  },

  async getThemeData(diyStyle, sysStyle) {
    const helpConfig = lodash.extend({}, sysStyle, diyStyle)
    const colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
    const colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
    const width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
    const theme = await this.getThemeCfg(helpConfig.theme, diyStyle.themeExclude || sysStyle.themeExclude)
    const themeStyle = theme.style || {}

    const ret = [
      `
      body{background-image:url(${theme.bg});width:${width}px;}
      .container{background-image:url(${theme.main});width:${width}px;}
      .help-table .td,.help-table .th{width:${100 / colCount}%}
      `
    ]

    const css = (sel, cssProp, key, def, fn) => {
      let val = Data.def(themeStyle[key], diyStyle[key], sysStyle[key], def)
      if (fn) val = fn(val)
      ret.push(`${sel}{${cssProp}:${val}}`)
    }

    css(".help-title,.help-group", "color", "fontColor", "#ceb78b")
    css(".help-title,.help-group", "text-shadow", "fontShadow", "none")
    css(".help-desc", "color", "descColor", "#eee")
    css(".cont-box", "background", "contBgColor", "rgba(43, 52, 61, 0.8)")
    css(".cont-box", "backdrop-filter", "contBgBlur", 3, (n) => diyStyle.bgBlur === false ? "none" : `blur(${n}px)`)
    css(".help-group", "background", "headerBgColor", "rgba(34, 41, 51, .4)")
    css(".help-table .tr:nth-child(odd)", "background", "rowBgColor1", "rgba(34, 41, 51, .2)")
    css(".help-table .tr:nth-child(even)", "background", "rowBgColor2", "rgba(34, 41, 51, .4)")

    return {
      style: `<style>${ret.join("\n")}</style>`,
      colCount
    }
  }
}

export default Theme
