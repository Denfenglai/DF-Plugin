import { PluginPath } from "#model"

const _ = new Set([ ...PluginPath.gitee, ...PluginPath.github ])

export default [
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
    field: "CodeUpdate.Group",
    helpMessage: "检测到仓库更新后推送的群列表",
    label: "推送群",
    componentProps: {
      placeholder: "点击选择要推送的群"
    },
    component: "GSelectGroup"
  },
  {
    field: "CodeUpdate.QQ",
    helpMessage: "检测到仓库更新后推送的用户列表",
    label: "推送好友",
    componentProps: {
      placeholder: "点击选择要推送的好友"
    },
    component: "GSelectFriend"
  },
  {
    field: "CodeUpdate.AutoPath",
    label: "自动监听已安装的插件",
    component: "Switch"
  },
  {
    field: "CodeUpdate.Exclude",
    label: "排除的插件",
    component: "Select",
    componentProps: {
      allowClear: true,
      mode: "tags",
      options: Array.from(_).map((name) => ({ value: name }))
    }
  },
  {
    field: "CodeUpdate.GithubToken",
    label: "Github Api Token",
    helpMessage: "用于请求Github Api",
    bottomHelpMessage: "填写后可解除请求速率限制和监听私库",
    component: "Input",
    componentProps: {
      placeholder: "请输入Github Token"
    }
  },
  {
    field: "CodeUpdate.GithubList",
    label: "Github仓库路径",
    bottomHelpMessage: "格式：用户名/仓库名:分支名\n如: github.com/DenFengLai/DF-Plugin 则填 DenFengLai/DF-Plugin",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true
    }
  },
  {
    field: "CodeUpdate.GithubReleases",
    label: "Github发行版仓库路径",
    bottomHelpMessage: "格式：用户名/仓库名\n如: github.com/DenFengLai/DF-Plugin 则填 DenFengLai/DF-Plugin",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true
    }
  },
  {
    field: "CodeUpdate.GiteeToken",
    label: "Gitee Api Token",
    helpMessage: "用于请求 Gitee Api",
    bottomHelpMessage: "填写后可解除请求速率限制和监听私库",
    component: "Input",
    componentProps: {
      placeholder: "请输入Gitee Token"
    }
  },
  {
    field: "CodeUpdate.GiteeList",
    label: "Gitee仓库路径",
    bottomHelpMessage: "格式：用户名/仓库名:分支名\n如: https://gitee.com/denfenglai/DF-Plugin 则填 denfenglai/DF-Plugin",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true
    }
  },
  {
    field: "CodeUpdate.GiteeReleases",
    label: "Gitee发行版仓库路径",
    bottomHelpMessage: "格式：用户名/仓库名\n如: https://gitee.com/denfenglai/DF-Plugin 则填 denfenglai/DF-Plugin",
    component: "GTags",
    componentProps: {
      allowAdd: true,
      allowDel: true
    }
  }
]
