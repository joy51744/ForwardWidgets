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
      title: "IMDb Watchlist",
      requiresWebView: false,
      functionName: "loadImdbWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "用户ID",
          type: "input",
          default: "ur204635540",  // ✅ 預設改為此 ID
          description: "IMDb 用户 ID，例如：ur12345678",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
    },
  ],
};

async function loadImdbWatchlist(params = {}) {
  try {
    const userId = params.user_id || "ur204635540"; // ✅ 這裡也加了預設值（如需強制）
    const page = params.page || 1;
    const count = 100;
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
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    const doc = Widget.dom.parse(response.data);
    const elements = Widget.dom.select(doc, 'a[href^="/title/tt"]');

    if (!elements || elements.length === 0) {
      throw new Error("未找到任何 IMDb ID，请确认 Watchlist 是否为公开状态");
    }

    let imdbIds = Array.from(
      new Set(
        elements
          .map((el) => Widget.dom.attr(el, "href"))
          .filter((href) => /^\/title\/tt\d+/.test(href))
          .map((href) => {
            const match = href.match(/(tt\d+)/);
            return match ? match[1] : null;
          })
          .filter(Boolean)
      )
    );

    imdbIds = imdbIds.slice(minNum - 1, maxNum);

    return imdbIds.map((id) => ({
      id,
      type: "imdb",
    }));
  } catch (error) {
    console.error("IMDb Watchlist 处理失败:", error);
    throw error;
  }
}
