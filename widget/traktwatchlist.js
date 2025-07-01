// == Trakt Watchlist 模块（单一模块版）==

const WidgetMetadata = {
  id: "TraktWatchlist",
  title: "Trakt 想看清单（支持日剧平台筛选）",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "基于 Trakt 用户想看列表，并可按 TMDB 日剧平台进行筛选（无需 API Key）",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      title: "Trakt 想看清单",
      requiresWebView: false,
      functionName: "loadTraktWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "user_name",
          title: "Trakt 用户名",
          type: "input",
          description: "需在 Trakt 设置中关闭隐私",
        },
        {
          name: "japan_network",
          title: "日剧播放平台",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "NHK", value: "2716" },
            { title: "Fuji TV", value: "2440" },
            { title: "NTV", value: "328" },
            { title: "TBS", value: "291" },
            { title: "TV Tokyo", value: "233" },
            { title: "WOWOW", value: "2077" },
            { title: "TV Asahi", value: "332" },
            { title: "KTV", value: "2697" },
            { title: "MBS", value: "2699" },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        },
      ],
    }
  ]
};

async function loadTraktWatchlist(params = {}) {
  const page = params.page || 1;
  const userName = params.user_name || "";
  const networkId = params.japan_network || "";

  if (!userName) throw new Error("必须提供 Trakt 用户名");

  const count = 20;
  const size = 6;
  const minNum = ((page - 1) % size) * count + 1;
  const maxNum = minNum + count - 1;
  const traktPage = Math.floor((page - 1) / size) + 1;

  const url = `https://trakt.tv/users/${userName}/watchlist?page=${traktPage}`;
  const items = await fetchTraktData(url, {}, "watchlist", minNum, maxNum);

  if (networkId) {
    return await filterByTmdbJapanNetwork(items, networkId);
  }
  return items;
}
