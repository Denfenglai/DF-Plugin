export default [
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
    field: "sendMaster.replyQQ",
    label: "发送成功是否回复主人QQ号",
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
  }
]
