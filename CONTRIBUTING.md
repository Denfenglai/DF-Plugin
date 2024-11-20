# 贡献指南

感谢您愿意为本项目做出贡献！遵循以下准则和步骤，以确保您的贡献符合项目的要求。

## 环境要求

在开始贡献之前，请确保您的开发环境满足以下要求：

- 安装 Node.js (推荐最新稳定版)
- 安装 Yunzai-Bot
- 安装 pnpm
- VSCode (可选)

## Fork本项目

前往[Gitee](https://gitee.com/DenFengLai/DF-Plugin)或[Github](https://gitee.com/DenFengLai/DF-Plugin)项目地址点击仓库上方的"fork"（或类似的按钮）将本项目fork到你的账户

## 克隆fork后的项目到本地

```sh
git clone 你fork的仓库地址
```

## 安装依赖

```sh
pnpm install
```

## 开发过程

在开发过程中请务必遵守以下规则

- 严格遵守ESLint的代码规范，确保代码质量并与本项目其他代码风格保持一致，提交前使用ESLint检查一遍后并解决发现的问题
  - 推荐安装使用VSCode的[ESLint拓展](https://github.com/Microsoft/vscode-eslint)，它可以帮助你在编写过程提示你所遇到的问题并提供解决方案
- 尽量遵循项目的代码风格和命名约定，以保持代码的可读性
- 提交的代码应该是经过测试的，并且不会破坏现有的功能。
- 在提交时，请务必遵守[Gitmoji](https://gitmoji.dev)典范，可以使用[VSCode拓展](https://github.com/seatonjiang/gitmoji-vscode)帮助你选择对应的Gitmoji

不合格的代码将会被打回

## 提交规范

为了确保提交的代码符合项目的要求，我们使用 Husky 和 lint-staged 进行 Git 提交时的规范检测。请按照以下步骤进行提交：

```sh
pnpm husky
git add .
pnpm run commit # 或 git commit
```

- 在提交时，Husky 会自动运行预定义的 Git 钩子脚本，包括对代码规范的检测，同时会使用[Gitmoji-cli](https://github.com/carloscuesta/gitmoji)进行交互式提交

- 如果提交的代码不符合项目的规范要求，您将会收到相应的错误提示。请根据提示信息进行修改和调整，直到提交的代码符合要求。

如果你是在VSCode上进行提交，请先确保您的代码已经通过 ESLint 的检查，随后便可在 “源代码管理” 提交框上方选择对应的Gitmoji后即可提交。

## 提交拉取请求

当您准备好将您的贡献合并到主项目中时，请按照以下步骤提交拉取请求：

1. 将您的本地分支推送到远程仓库：`git push origin master`

2. 在项目仓库的页面上，点击 "New Pull Request"（或类似的按钮），创建一个新的拉取请求。

3. 填写拉取请求的相关信息，包括描述您的贡献的详细内容和目的。

4. 提交拉取请求后，项目维护者将会审核您的代码，并与您协作以确保贡献的质量和一致性。

## 感谢您的贡献

非常感谢您为项目做出的贡献！您的工作对于项目的发展和成功至关重要。项目维护者会尽快审查您的贡献并与您合作，以确保其顺利合并到主项目中。

如果您有任何问题或需要进一步的帮助，请随时与项目维护者进行沟通。
