const WidgetMetadata = {
  id: "IMDbWatchlist",
  title: "IMDb Watchlist（含地区筛选）",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "通过抓取 IMDb 用户 Watchlist 页面并可筛选影片国家地区，无需 API Key",
  author: "huangxd",
  site: "https://www.imdb.com",
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
          description: "IMDb 用户 ID，例如：ur12345678",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
        {
          name: "region",
          title: "地区筛选",
          type: "input",
          description: "可选，填写国家英文名，如 Japan、South Korea、United States",
        },
      ],
    },
  ],
};

async function loadImdbWatchlist(params = {}) {
  try {
    const userId = params.user_id || "";
    const page = params.page || 1;
    const regionFilter = params.region || "";
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
      throw new Error("未找到任何 IMDb ID");
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

    if (!regionFilter) {
      // 不筛选地区，直接返回全部
      return imdbIds.map((id) => ({
        id,
        type: "imdb",
      }));
    }

    // 筛选地区，逐条请求详情页
    const filteredIds = [];

    for (const id of imdbIds) {
      try {
        const detailUrl = `https://www.imdb.com/title/${id}/`;
        const detailResponse = await Widget.http.get(detailUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
        const detailDoc = Widget.dom.parse(detailResponse.data);

        // 获取国家地区信息，IMDb页面中有带country_of_origin参数的链接
        const countryElements = Widget.dom.select(detailDoc, 'a[href^="/search/title?country_of_origin="]');
        const countries = countryElements.map((el) => el.textContent.trim());

        const matched = countries.some((c) => c.toLowerCase() === regionFilter.toLowerCase());

        if (matched) {
          filteredIds.push(id);
        }
      } catch (e) {
        // 单条详情请求失败，跳过
        continue;
      }
    }

    return filteredIds.map((id) => ({
      id,
      type: "imdb",
    }));
  } catch (error) {
    console.error("IMDb Watchlist 处理失败:", error);
    throw error;
  }
}
