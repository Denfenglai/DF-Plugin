import fetch from "node-fetch"

export default new class {
  /**
   * 获取仓库的最新数据
   * @param {string} repo - 仓库路径（用户名/仓库名）
   * @param {string} source - 数据源（GitHub/Gitee）
   * @param {string} type - 请求类型（commits/releases）
   * @param {string} token - 访问Token
   * @param {string} sha - 提交起始的SHA值或者分支名. 默认: 仓库的默认分支
   * @returns {Promise<object[]>} 提交数据或空数组
   */
  async getRepositoryData(repo, source, type = "commits", token, sha) {
    const isGitHub = source === "GitHub"
    const baseURL = isGitHub ? "https://api.github.com/repos" : "https://gitee.com/api/v5/repos"
    const path = sha ? `${repo}/commits/${sha}` : `${repo}/${type}?per_page=1`
    let url = `${baseURL}/${path}`

    if (!isGitHub && token) {
      url += `${sha ? "?" : "&"}access_token=${token}`
    }

    const headers = this.getHeaders(token, source)
    const data = await this.fetchData(url, headers, repo, source)
    return data
  }

  /**
   * 获取请求头
   * @param {string} token - 访问Token
   * @param {string} source - 数据源（GitHub/Gitee）
   * @returns {object} 请求头
   */
  getHeaders(token, source) {
    const headers = {
      "User-Agent": "request",
      "Accept": source === "GitHub" ? "application/vnd.github+json" : "application/vnd.gitee+json"
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  /**
   * 获取指定 URL 的 JSON 数据
   * @param {string} url - 请求的 URL
   * @param {object} [headers] - 请求头
   * @param {string} repo - 仓库路径
   * @param {string} source - 数据源
   * @returns {Promise<object | false>} 返回请求的数据或 false（请求失败）
   */
  async fetchData(url, headers = {}, repo, source) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers
      })

      if (!response.ok) {
        let msg
        switch (response.status) {
          case 401:
            msg = "访问令牌无效或已过期"
            break
          case 403:
            msg = "请求达到Api速率限制，请尝试填写token或稍后再试"
            break
          case 404:
            msg = "仓库不存在"
            break
          default:
            msg = `状态码：${response.status}`
            break
        }

        logger.error(`请求 ${logger.magenta(source)} 失败: ${logger.cyan(repo)}, ${msg}`)
        return false
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        logger.error(`响应非 JSON 格式: ${url} , 内容：${await response.text()}`)
        return false
      }

      return await response.json()
    } catch (error) {
      logger.error(`请求失败: ${url}，错误信息: ${error.stack}`)
      return false
    }
  }
}()
