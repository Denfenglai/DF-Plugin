import { Poke_List } from "#components"

export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "戳一戳配置"
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
        { label: "随机类型", value: "all" },
        ...Poke_List.map((name, id) => ({ label: name, value: id }))
      ]
    }
  },
  {
    field: "other.Black",
    label: "随机类型排除列表",
    bottomHelpMessage: "设置戳一戳类型为随机时将不会随机到以下类型",
    component: "Select",
    componentProps: {
      allowClear: true,
      mode: "tags",
      options: Poke_List.map((name) => ({ value: name }))
    }
  }
]
