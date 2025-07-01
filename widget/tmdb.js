const WidgetMetadata = {
  id: "forward.tmdb.watchlist",
  title: "TMDB Watchlist（无API Key HTML解析，自动翻页）",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "通过解析TMDB用户公开网页，自动翻页获取Watchlist、收藏、评分列表，无需API Key",
  author: "ChatGPT",
  site: "https://github.com/joy51744/ForwardWidgets",
  modules: [
    {
      title: "TMDB 用户 Watchlist 自动翻页",
      requiresWebView: false,
      functionName: "loadTmdbWatchlistAutoPaging",
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "TMDB 用户ID（数字）",
          type: "input",
          description: "必填，TMDB网站的用户数字ID，例如 12345678",
        },
        {
          name: "list_type",
          title: "列表类型",
          type: "enumeration",
          enumOptions: [
            { title: "想看 (Watchlist)", value: "watchlist" },
            { title: "收藏 (Favorites)", value: "favorites" },
            { title: "评分过 (Rated)", value: "rated" },
          ],
          defaultValue: "watchlist",
        },
        {
          name: "media_type",
          title: "媒体类型",
          type: "enumeration",
          enumOptions: [
            { title: "电影", value: "movies" },
            { title: "电视剧", value: "tv" },
          ],
          defaultValue: "movies",
        },
      ],
    },
  ],
};

async function loadTmdbWatchlistAutoPaging(params = {}) {
  const userId = params.user_id;
  const listType = params.list_type || "watchlist";
  const mediaType = params.media_type || "movies";

  if (!userId) {
    throw new Error("缺少 TMDB 用户ID");
  }

  const maxPages = 20; // 最多翻20页防止请求过多
  let currentPage = 1;
  let allItems = [];

  while (currentPage <= maxPages) {
    const url = `https://www.themoviedb.org/user/${userId}/${listType}/${mediaType}?page=${currentPage}`;
    try {
      const response = await Widget.http.get(url, {
        headers: {
          Referer: `https://www.themoviedb.org/user/${userId}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        },
      });

      const html = response.data;
      const docId = Widget.dom.parse(html);
      if (docId < 0) {
        console.warn(`第${currentPage}页解析失败，停止翻页`);
        break;
      }

      const cardElements = Widget.dom.select(docId, ".card.style_1");
      if (!cardElements || cardElements.length === 0) {
        console.log(`第${currentPage}页无数据，停止翻页`);
        break;
      }

      let pageItems = [];
      for (const cardId of cardElements) {
        const dataId = await Widget.dom.attr(cardId, "data-id");
        if (dataId) {
          pageItems.push({
            id: Number(dataId),
            type: "tmdb",
          });
        }
      }

      if (pageItems.length === 0) {
        console.log(`第${currentPage}页无有效条目，停止翻页`);
        break;
      }

      allItems = allItems.concat(pageItems);

      // 如果当前页条目数少于卡片数量，说明已到最后一页
      if (pageItems.length < cardElements.length) {
        break;
      }

      currentPage++;
    } catch (err) {
      console.error(`请求第${currentPage}页失败，停止翻页:`, err);
      break;
    }
  }

  // 去重
  const seen = new Set();
  const uniqueItems = allItems.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return uniqueItems;
}

