import { Config } from "./components/index.js"

/**
 *  支持锅巴
 *  锅巴插件：https://gitee.com/guoba-yunzai/guoba-plugin.git
 *  组件类型，可参考 https://antdv.com/components/overview-cn/
 */

export function supportGuoba() {
  return {
    pluginInfo: {
      name: "DF-Plugin",
      title: "DF-Plugin",
      description: "提供Yunzai-Bot拓展功能",
      author: "@等风来",
      authorLink: "https://gitee.com/DengFengLai-F",
      link: "https://gitee.com/DenFengLai/DF-Plugin",
      isV3: true,
      isV2: false,
      showInMenu: "auto",
      icon: "svg-spinners:blocks-wave",
      iconColor: "#d19f56"
    },
    configInfo: {
      schemas: [
        {
          component: "Divider",
          label: "联系主人设置"
        },
        {
          field: "sendMaster.open",
          label: "功能开关",
          bottomHelpMessage: "允许用户联系主人",
          component: "Switch"
        },
        {
          field: "sendMaster.cd",
          label: "触发冷却",
          helpMessage: "主人不受限制",
          bottomHelpMessage: "单位：秒",
          component: "InputNumber",
          required: true,
          componentProps: {
            min: 1,
            placeholder: "请输入冷却时间"
          }
        },
        {
          field: "sendMaster.Master",
          label: "主人配置",
          helpMessage: "填主人QQ可发送某个指定主人",
          bottomHelpMessage: "0：仅发送首个主人 1：发送全部主人 QQ号：发送指定QQ号",
          component: "Input",
          required: true,
          componentProps: {
            placeholder: "请输入主人QQ或配置项"
          }
        },
        {
          field: "sendMaster.BotId",
          label: "Bot配置",
          bottomHelpMessage: "指定某个Bot发送，为0时为触发Bot",
          component: "Input",
          required: true,
          componentProps: {
            placeholder: "请输入Bot账号或配置项"
          }
        },
        {
          field: "sendMaster.sendAvatar",
          label: "消息附带触发者头像",
          bottomHelpMessage: "微信Bot如果遇到报错请关闭此项。",
          component: "Switch"
        },
        {
          field: "sendMaster.banWords",
          label: "违禁词",
          bottomHelpMessage: "当消息包含下列内容时将不会发送给主人",
          component: "GTags",
          componentProps: {
            allowAdd: true,
            allowDel: true
          }
        },
        {
          field: "sendMaster.banUser",
          label: "禁用用户",
          bottomHelpMessage: "不允许该用户联系主人",
          component: "GTags",
          componentProps: {
            allowAdd: true,
            allowDel: true
          }
        },
        {
          field: "sendMaster.banGroup",
          label: "禁用群",
          helpMessage: "不允许通过该群联系主人的群聊",
          componentProps: {
            placeholder: "点击选择要禁用的群"
          },
          component: "GSelectGroup"
        },
        {
          component: "Divider",
          label: "戳一戳设置"
        },
        {
          field: "other.chuo",
          label: "戳一戳开关",
          component: "Switch"
        },
        {
          field: "other.chuoType",
          label: "戳一戳图片类型",
          bottomHelpMessage: "自定义图片需在resources/poke/default中添加",
          component: "RadioGroup",
          required: true,
          componentProps: {
            options: [
              { label: "柴郡表情包", value: 1 },
              { label: "丛雨表情包", value: 2 },
              { label: "诗歌剧表情包", value: 3 },
              { label: "千恋万花表情包", value: 4 },
              { label: "小南梁表情包", value: 5 },
              { label: "小鲨鱼古拉", value: 6 },
              { label: "甘城猫猫表情", value: 7 },
              { label: "龙图", value: 8 },
              { label: "满穗表情包", value: 9 },
              { label: "猫猫虫表情", value: 10 },
              { label: "纳西妲表情包", value: 11 },
              { label: "心海表情包", value: 12 },
              { label: "fufu表情包", value: 13 },
              { label: "自定义图片", value: 0 }
            ]
          }
        },
        {
          component: "Divider",
          label: "Git仓库监听设置"
        },
        {
          field: "CodeUpdate.Auto",
          label: "自动检查开关",
          component: "Switch"
        },
        {
          field: "CodeUpdate.Cron",
          label: "自动检查定时表达式",
          helpMessage: "修改后重启生效",
          bottomHelpMessage: "自动检查Cron表达式",
          component: "EasyCron",
          componentProps: {
            placeholder: "请输入Cron表达式"
          }
        },
        {
          field: "CodeUpdate.Gruop",
          helpMessage: "检测到仓库更新后推送的群列表",
          label: "推送群",
          componentProps: {
            placeholder: "点击选择要推送的群"
          },
          component: "GSelectGroup"
        },
        {
          field: "CodeUpdate.GitList",
          label: "关注的Git仓库路径",
          bottomHelpMessage: "格式：用户名/仓库名\n如: github.com/DenFengLai/DF-Plugin 则填 DenFengLai/DF-Plugin",
          component: "GTags",
          required: true,
          componentProps: {
            allowAdd: true,
            allowDel: true
          }
        },
        {
          component: "Divider",
          label: "图片外显设置"
        },
        {
          field: "summary.sum",
          label: "图片外显开关",
          component: "Switch"
        },
        {
          field: "summary.type",
          label: "外显类型",
          bottomHelpMessage: "可选自定义文本或使用一言接口",
          component: "RadioGroup",
          required: true,
          componentProps: {
            options: [
              { label: "自定义文字", value: 1 },
              { label: "使用一言接口", value: 2 }
            ]
          }
        },
        {
          field: "summary.text",
          label: "自定义外显文字",
          helpMessage: "输入文字可在发送图片时显示",
          bottomHelpMessage: "设置外显类型为自定义文字时可用",
          component: "Input",
          required: true,
          componentProps: {
            placeholder: "请输入文字外显"
          }
        },
        {
          field: "summary.api",
          label: "一言接口地址",
          helpMessage: "图片外显请求的接口地址",
          bottomHelpMessage: "无特殊情况不要改",
          component: "Input",
          required: true,
          componentProps: {
            placeholder: "请输入接口地址"
          }
        },
        {
          component: "Divider",
          label: "其他"
        },
        {
          field: "other.ys",
          label: "原神关键词发图",
          helpMessage: "无用的功能+1",
          component: "Switch"
        }
      ],

      getConfigData() {
        return {
          other: Config.other,
          sendMaster: Config.sendMaster,
          CodeUpdate: Config.CodeUpdate,
          summary: Config.summary
        }
      },

      setConfigData(data, { Result }) {
        for (let key in data) {
          Config.modify(...key.split("."), data[key])
        }
        return Result.ok({}, "Ciallo～(∠・ω< )⌒☆")
      }
    }
  }
}
