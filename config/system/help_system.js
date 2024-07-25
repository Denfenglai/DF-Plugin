/*
* 此配置文件为系统使用，请勿修改，否则可能无法正常使用
* */

export const helpCfg = {
  title: "DF帮助",
  subTitle: "[DF插件] Yunzai-Bot&DF-Plugin",
  columnCount: 4,
  colWidth: 300,
  theme: "all",
  themeExclude: [ "default" ],
  style: {
    fontColor: "#ceb78b",
    descColor: "#eee",
    contBgColor: "rgba(6, 21, 31, .5)",
    contBgBlur: 0,
    headerBgColor: "rgba(255, 222, 142, 0.44)",
    rowBgColor1: "rgba(255, 166, 99, 0.23)",
    rowBgColor2: "rgba(251, 113, 107, 0.35)"
  }
}

export const helpList = [
  {
    "group": "功能类",
    "list": [
      {
        "icon": 1,
        "title": "#来首歌",
        "desc": "随机网易云音乐"
      },
      { "icon": 2,
        "title": "戳一戳机器人",
        "desc": "戳一戳机器人发送随机表情包"
      },
      { "icon": 4,
        "title": "拾取关键词原神",
        "desc": "本来聊得好好的，突然有人聊起了原神，搞得大家都不高兴" 
      }
    ]
  },
  {
  "group": "随机图片类",
    "list": [
      {
        "icon": 35,
        "title": "来张制服",
        "desc": "随机jk图片"
      },
      {
        "icon": 5,
        "title": "来张黑丝",
        "desc": "顾名思义"
      },
      {
        "icon": 3,
        "title": "来张cos",
        "desc": "随机cos图片"
      },
      {
        "icon": 8,
        "title": "来张腿子",
        "desc": "kkt"
      },
      {
        "icon": 16,
        "title": "随机从雨",
        "desc": "随机从雨图片"
      },
      {
        "icon": 33,
        "title": "随机诗歌剧",
        "desc": "随机诗歌剧图片"
      },
    ]
  },
  {
    "group": "管理员功能",
    "auth": "master",
    "list": [
      {
        "icon":13,
        "title": "联系主人",
        "desc": "给主人发消息"  
     },
     {  "icon": 14,
        "title": "回复",
        "desc": "回复群友给你发的消息" 
    },
    {  "icon": 15,
        "title": "DF(强制)更新",
        "desc": "使用Git更新插件"
    }
    ]

  }
]

export const isSys = true
