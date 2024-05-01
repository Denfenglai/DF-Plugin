import _ from "lodash";

  /**
   * 工具函数：获取图片链接
   * @param e - 消息事件
   * @return img - 图片链接数组
   */
   async function ImageLink(e) {
    let img = [];
    if (e.source) {
      let source;
      if (e.isGroup) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop();
      } else {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop();
      }
      img = source.message.filter(i => i.type === "image").map(i => i.url);
    } else {
      img = e.img;
    }

    if (_.isEmpty(img)) {
      await this.reply("⚠ 请回复或带图使用");
      return false
    }
    await e.reply(`✅ 检测到${img.length}张图片`);
    return img
  }
  

export { ImageLink }