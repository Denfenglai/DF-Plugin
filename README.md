# DF-Plugin

![Nodejs](https://img.shields.io/badge/-Node.js-3C873A?style=flat&logo=Node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-eed718?style=flat&logo=javascript&logoColor=ffffff)
[![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square)](https://gitmoji.dev)

![Yunzai-Bot](https://img.shields.io/badge/Yunzai_Bot-V3.0-red)
![Miao-Yunzai](https://img.shields.io/badge/Miao_Yunzai-V3-yellow)
![Miao-Yunzai](https://img.shields.io/badge/Miao_Yunzai-V4-green)
![TRSS-Yunzai](https://img.shields.io/badge/TRSS_Yunzai-V3-blue)

[![star](https://gitee.com/DenFengLai/DF-Plugin/badge/star.svg?theme=dark)](https://gitee.com/DenFengLai/DF-Plugin/stargazers)
[![fork](https://gitee.com/DenFengLai/DF-Plugin/badge/fork.svg?theme=dark)](https://gitee.com/DenFengLai/DF-Plugin/members)

[![Fork me on Gitee](https://gitee.com/DenFengLai/DF-Plugin/widgets/widget_6.svg)](https://gitee.com/DenFengLai/DF-Plugin)

### 咕咕中：15%

适用于Miao-Yunzai和TRSS-Yunzai的拓展插件，打算继承[Yenai-Plugin](https://yenai.trss.me)文件结构（CV），基于此结构进行二创、修改。

## 💡 V3安装教程

- 使用Gitee
```sh
git clone -b master --depth=1 https://gitee.com/DenFengLai/DF-Plugin.git ./plugins/DF-Plugin
```

- 使用Githb
```sh
git clone -b master --depth=1 https://github.com/DenFengLai/DF-Plugin.git ./plugins/DF-Plugin
```

## 🔮 V4安装教程

> 只做了简单测试，不排除存在其他问题
> 项目主更新V3版本，V4版本可能更新不及时

- 使用Gitee
```sh
git clone -b v4 --depth=1 https://gitee.com/DenFengLai/DF-Plugin.git ./plugins/DF-Plugin
```

- 使用Githb
```sh
git clone -b v4 --depth=1 https://github.com/DenFengLai/DF-Plugin.git ./plugins/DF-Plugin
```
## 🤗 已实现的功能

<details><summary>随机图片</summary>

- #来张JK / 黑丝 / cos / 腿子

- 从API获取一张图片
    
</details>

<details><summary>给主人带话</summary>
      
 - #联系主人 + `消息内容`  
      
- 详细配置请见`config/sendMaster.yaml`

</details>

<details><summary>随机网易云</summary>
       
- #来首歌

- 从API获取一首网易云歌曲

</details>

<details><summary>随机表情戳一戳</summary>
    
戳一戳返回随机表情包  

配置项：

- `柴郡表情包：1`
- `丛雨表情包：2`
- `诗歌剧：3`
- `千恋万花表情包：4`
- `小南梁表情包：5`
- `自定义表情包：0`
  - 自行在`resources/chuo/default`中添加图片
  - 没有会报错
- `config/other.yaml`中配置 `chuoType`
  
</details>

## 📄 计划工程 

- [x] 能跑
- [x] 能用
- [x] 支持用户自定义配置
- [ ] 添加帮助信息和版本信息
- [ ] 丰富功能
- [ ] 持续完善
- [ ] .......
- [ ] ~~删库跑路~~

## ✨ 贡献者
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

感谢这些了不起的人 ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/yeyang52"><img src="https://avatars.githubusercontent.com/u/107110851?v=4?s=100" width="100px;" alt="yeyang"/><br /><sub><b>yeyang</b></sub></a><br /><a href="#example-yeyang52" title="Examples">💡</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TimeRainStarSky"><img src="https://avatars.githubusercontent.com/u/63490117?v=4?s=100" width="100px;" alt="时雨◎星空"/><br /><sub><b>时雨◎星空</b></sub></a><br /><a href="#mentoring-TimeRainStarSky" title="Mentoring">🧑‍🏫</a> <a href="https://github.com/Denfenglai/DF-Plugin/commits?author=TimeRainStarSky" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/qsyhh"><img src="https://avatars.githubusercontent.com/u/132750431?v=4?s=100" width="100px;" alt="其实雨很好"/><br /><sub><b>其实雨很好</b></sub></a><br /><a href="https://github.com/Denfenglai/DF-Plugin/commits?author=qsyhh" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://gitee.com/adrae"><img src="https://foruda.gitee.com/avatar/1706324987763497611/13205155_adrae_1706324987.png!avatar200" width="100px;" alt="Admilk"/><br /><sub><b>admilk</b></sub></a><br /><a href="https://github.com/Denfenglai/DF-Plugin/commits?author=Admilkk" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

本段遵循 [all-contributors](https://github.com/all-contributors/all-contributors) 规范，欢迎任何形式的贡献！

## 💬 免责声明

1. 本项目仅供学习使用，请勿用于商业等场景。  

2. 项目内图片、API等资源均来源于网络，如果侵犯了您的利益请联系我进行删除。

## 🍀 意见反馈

如果您对本插件有什么建议或使用遇到了bug欢迎对本项目提交issues，我会尽可能完善。

## 🎨 参与贡献

如果您对本项目有兴趣，欢迎对本项目进行[Pull Requests](https://github.com/DenFengLai/DF-Plugin/pulls)
