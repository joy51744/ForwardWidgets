// forward.imdb 组件
const WidgetMetadata = {
  id: "forward.imdb",
  title: "IMDb",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "IMDb 想看清单抓取（无需 API Key）",
  author: "Forward",
  site: "https://github.com/ForwardWidgets",
  modules: [
    {
      id: "imdb_watchlist",
      title: "IMDb 想看清单",
      requiresWebView: false,
      functionName: "loadIMDbWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "watchlist_id",
          title: "IMDb 片单 ID",
          type: "input",
          description: "如 ls076305441，可从 imdb.com/list/lsXXXXXXX/ 中取得",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
        {
          name: "random",
          title: "随机模式",
          type: "boolean",
        },
      ],
    },
  ],
};

async function loadIMDbWatchlist(params = {}) {
  try {
    const listId = params.watchlist_id || "";
    const page = params.page || 1;
    const random = params.random || false;

    if (!listId) {
      throw new Error("必须提供 IMDb Watchlist ID");
    }

    const url = `https://www.imdb.com/list/${listId}/?page=${page}`;
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const docId = Widget.dom.parse(response.data);
    const elements = Widget.dom.select(docId, '[data-testid="grid-layout"] a.ipc-title-link-wrapper');

    const imdbIds = Array.from(
      new Set(
        elements
          .map((el) => Widget.dom.attr(el, "href"))
          .filter(Boolean)
          .map((href) => {
            const match = href.match(/\/title\/(tt\d+)/);
            return match ? match[1] : null;
          })
          .filter(Boolean)
      )
    );

    const finalList = random
      ? shuffleArray(imdbIds).slice(0, 9)
      : imdbIds;

    return finalList.map((id) => ({
      id,
      type: "imdb",
    }));
  } catch (e) {
    console.error("IMDb Watchlist 加载失败:", e);
    throw e;
  }
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
