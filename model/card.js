import fetch from "node-fetch";

  /** 
   * 工具函数：生成大图卡片
   * @param link - 图片地址
   * @param title - 标题
   * @param subtitle - 子标题
   * @param yx - 卡片外显
   * @return data - json卡片代码
   */
  async function ImageCard(link, title='', subtitle='', yx='[DF图转卡]') {
    logger.mark("正在签名卡片，请稍候...");
    const response = await fetch(`http://api.mrgnb.cn/API/qq_ark37.php?url=${link}&title=${title}&subtitle=${subtitle}&yx=${yx}`);
    const data = await response.text();
    return data;
  }

  /**
   * 工具函数：生成文字卡片消息
   * @param msg - 消息内容
   * @param bt - 标题
   * @param yx - 外显
   * @return data - json卡片代码
   */
  async function TextCard(msg, bt='', yx='') {
    logger.mark("正在签名卡片，请稍候...");
    const response = await fetch(`http://api.mrgnb.cn/API/qq_ark.php?name=${msg}&title=${bt}&yx=${yx}`);
    const data = await response.text();
    return data;
  }

export { ImageCard, TextCard }