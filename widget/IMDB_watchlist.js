WidgetMetadata = {
  id: "IMDbWatchlist",
  title: "IMDb Watchlist",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "通过抓取 IMDb 用户 Watchlist 页面解析 IMDb ID，无需 API Key",
  author: "huangxd",
  site: "https://github.com/joy51744/ForwardWidgets",
  modules: [
    {
      title: "IMDb想看片單",
      requiresWebView: false,
      functionName: "loadImdbWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "IMDb用户ID",
          type: "input",
          description: "例如：ur204635540，可从 IMDb 个人主页地址中获取",
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        },
      ],
    }
  ],
};
async function loadImdbWatchlist(params = {}) {
  try {
    const userId = params.user_id;
    const page = params.page || 1;
    const count = 20;
    const minNum = (page - 1) * count + 1;
    const maxNum = page * count;

    if (!userId) {
      throw new Error("必须提供 IMDb 用户 ID");
    }

    const url = `https://www.imdb.com/user/${userId}/watchlist`;

    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const docId = Widget.dom.parse(response.data);
    const scriptTags = Widget.dom.select(docId, 'script');

    let imdbIds = [];

    for (let script of scriptTags) {
      const text = Widget.dom.text(script);
      if (text.includes("IMDbReactInitialState")) {
        const jsonStr = text.match(/IMDbReactInitialState.push\((\{.+?\})\);/);
        if (jsonStr && jsonStr[1]) {
          const data = JSON.parse(jsonStr[1]);
          const list = data?.list?.listItems || [];
          imdbIds = list.map(item => item.const).filter(Boolean);
          break;
        }
      }
    }

    // 分页裁剪
    const pageItems = imdbIds.slice(minNum - 1, maxNum);
    return pageItems.map(id => ({
      id,
      type: "imdb"
    }));
  } catch (error) {
    console.error("IMDb Watchlist 解析失败:", error);
    throw error;
  }
}
