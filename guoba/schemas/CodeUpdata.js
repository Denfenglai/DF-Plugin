import { PluginPath } from "#model"

export default [
  {
    component: "SOFT_GROUP_BEGIN",
    label: "Git仓库监听配置"
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
    field: "CodeUpdate.GithubToken",
    label: "Github Api Token",
    helpMessage: "用于请求Github Api",
    bottomHelpMessage: "填写后可解除请求速率限制和监听私库，获取地址：https://gitee.com/profile/personal_access_tokens",
    component: "InputPassword",
    componentProps: {
      placeholder: "请输入Github Token"
    }
  },
  {
    field: "CodeUpdate.GiteeToken",
    label: "Gitee Api Token",
    helpMessage: "用于请求 Gitee Api",
    bottomHelpMessage: "填写后可解除请求速率限制和监听私库，获取地址：https://github.com/settings/tokens",
    component: "InputPassword",
    componentProps: {
      placeholder: "请输入Gitee Token"
    }
  },
  {
    field: "CodeUpdate.List",
    label: "推送列表",
    bottomHelpMessage: "Git仓库推送列表",
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "Group",
          helpMessage: "检测到仓库更新后推送的群列表",
          label: "推送群",
          componentProps: {
            placeholder: "点击选择要推送的群"
          },
          component: "GSelectGroup"
        },
        {
          field: "QQ",
          helpMessage: "检测到仓库更新后推送的用户列表",
          label: "推送好友",
          componentProps: {
            placeholder: "点击选择要推送的好友"
          },
          component: "GSelectFriend"
        },
        {
          field: "AutoPath",
          label: "获取已安装的插件",
          component: "Switch"
        },
        {
          field: "Exclude",
          label: "排除的插件",
          component: "Select",
          componentProps: {
            allowClear: true,
            mode: "tags",
            options: Array.from((new Set([ ...PluginPath.gitee, ...PluginPath.github ]))).map((name) => ({ value: name }))
          }
        },
        {
          field: "GithubList",
          label: "Github仓库路径",
          bottomHelpMessage: "格式：用户名/仓库名:分支名，如: github.com/DenFengLai/DF-Plugin 则填 DenFengLai/DF-Plugin",
          component: "GTags",
          componentProps: {
            allowAdd: true,
            allowDel: true
          },
          showPrompt: true,
          promptProps: {
            content: "请输入 所有者/存储库:分支",
            placeholder: "请输入仓库路径",
            okText: "添加",
            rules: [ { required: true, message: "不可以为空哦" } ]
          }
        },
        {
          field: "GithubReleases",
          label: "Github发行版仓库路径",
          bottomHelpMessage: "格式：所有者/存储库:分支",
          component: "GTags",
          componentProps: {
            allowAdd: true,
            allowDel: true
          },
          showPrompt: true,
          promptProps: {
            content: "请输入 所有者/存储库:分支",
            placeholder: "请输入仓库路径",
            okText: "添加",
            rules: [ { required: true, message: "不可以为空哦" } ]
          }
        },
        {
          field: "GiteeList",
          label: "Gitee仓库路径",
          bottomHelpMessage: "格式：所有者/存储库:分支",
          component: "GTags",
          componentProps: {
            allowAdd: true,
            allowDel: true
          },
          showPrompt: true,
          promptProps: {
            content: "请输入 所有者/存储库:分支",
            placeholder: "请输入仓库路径",
            okText: "添加",
            rules: [ { required: true, message: "不可以为空哦" } ]
          }
        },
        {
          field: "GiteeReleases",
          label: "Gitee发行版仓库路径",
          bottomHelpMessage: "格式：所有者/存储库:分支",
          component: "GTags",
          componentProps: {
            allowAdd: true,
            allowDel: true
          },
          showPrompt: true,
          promptProps: {
            content: "请输入 所有者/存储库:分支",
            placeholder: "请输入仓库路径",
            okText: "添加",
            rules: [ { required: true, message: "不可以为空哦" } ]
          }
        },
        {
          field: "note",
          label: "备注",
          component: "Input"
        }
      ]
    }
  }
]
