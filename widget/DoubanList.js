// 豆瓣片单组件
const WidgetMetadata = {
  id: "douban",
  title: "豆瓣",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "解析豆瓣片单，获取视频信息",
  author: "JoyMa",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets",
  modules: [
    {
      title: "片单",
      requiresWebView: false,
      functionName: "loadCardItems",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "input",
          description: "豆瓣片单地址",
          placeholders: [
            {
              title: "北京电影学院硕士要看的100部电影",
              value: "https://www.douban.com/doulist/42564/",
            },
            {
              title: "电影学院本科生必看100部",
              value: "https://www.douban.com/doulist/108673/",
            },
          ],
        },
        {
          name: "start",
          title: "开始位置",
          type: "count",
        },
        {
          name: "fetchAll",
          title: "抓取全部頁面",
          type: "switch",
          default: false,
        },
      ],
    },
  ],
};
async function loadCardItems(params = {}) {
  try {
    console.log("开始解析豆瓣片单...");
    console.log("参数:", params);

    const url = params.url;
    if (!url) throw new Error("缺少片单 URL");

    if (url.includes("douban.com/doulist/")) {
      return await loadDefaultList(params);
    } else if (url.includes("douban.com/subject_collection/")) {
      throw new Error("尚未支援 subject_collection 類型");
    } else {
      throw new Error("不支援的豆瓣地址格式");
    }
  } catch (error) {
    console.error("解析豆瓣片单失败:", error);
    throw error;
  }
}

async function loadDefaultList(params = {}) {
  const url = params.url;
  const listId = url.match(/doulist\/(\d+)/)?.[1];
  if (!listId) throw new Error("无法获取片单 ID");

  const fetchAll = params.fetchAll || false;
  const doubanIds = [];

  const pageSize = 25;
  let start = params.start || 0;
  let hasMore = true;
  let currentPage = 0;
  let totalPages = 1;

  while (hasMore) {
    const pageUrl = `https://www.douban.com/doulist/${listId}/?start=${start}`;
    const response = await Widget.http.get(pageUrl, {
      headers: {
        Referer: "https://movie.douban.com/explore",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
      },
    });

    if (response.status !== 200 || !response.data.includes("doulist-item")) {
      throw new Error("豆瓣頁面異常或無法訪問");
    }

    // 嘗試解析總頁數
    const totalMatch = response.data.match(/共(\d+)条/);
    if (totalMatch) {
      const totalItems = parseInt(totalMatch[1]);
      totalPages = Math.ceil(totalItems / pageSize);
      currentPage = Math.floor(start / pageSize) + 1;
    }

    const docId = Widget.dom.parse(response.data);
    if (docId < 0) throw new Error("解析 HTML 失败");

    const videoElementIds = Widget.dom.select(docId, ".doulist-item .title a");
    for (const itemId of videoElementIds) {
      const link = await Widget.dom.attr(itemId, "href");
      const id = link.match(/subject\/(\d+)/)?.[1];
      if (id) {
        doubanIds.push({
          id,
          type: "douban",
          url: `https://movie.douban.com/subject/${id}/`,
        });
      }
    }

    if (!fetchAll) break;

    start += pageSize;
    hasMore = response.data.includes("class=\"next\""); // 若無「下一頁」則結束
  }

  // 顯示當前頁數提示
  if (!fetchAll && totalPages > 1) {
    doubanIds.unshift({
      id: `第 ${currentPage} / ${totalPages} 頁`,
      type: "text",
    });
  }

  return doubanIds;
}
