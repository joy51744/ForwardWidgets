// == Trakt Widget 全套函数（含日剧播放平台筛选）==

const WidgetMetadata = {
  id: "Trakt",
  title: "Trakt我看&Trakt个性化推荐+日剧平台筛选",
  version: "1.0.13",
  requiredVersion: "0.0.1",
  description: "解析Trakt想看、在看、已看、片单、追剧日历、个性化推荐，并支持日剧播放平台筛选（基于 TMDB Network ID）",
  author: "huangxd + Forward",
  site: "https://github.com/huangxd-/ForwardWidgets",
  modules: [
    {
      title: "trakt我看",
      requiresWebView: false,
      functionName: "loadInterestItems",
      cacheDuration: 3600,
      params: [
        {
          name: "user_name",
          title: "用户名",
          type: "input",
        },
        {
          name: "status",
          title: "状态",
          type: "enumeration",
          enumOptions: [
            { title: "想看", value: "watchlist" },
            { title: "在看", value: "progress" },
            { title: "看过-电影", value: "history/movies/added/asc" },
            { title: "看过-电视", value: "history/shows/added/asc" },
            { title: "随机想看", value: "random_watchlist" },
          ],
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
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      title: "Trakt个性化推荐",
      requiresWebView: false,
      functionName: "loadSuggestionItems",
      cacheDuration: 43200,
      params: [
        {
          name: "cookie",
          title: "用户Cookie",
          type: "input",
        },
        {
          name: "type",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "电影", value: "movies" },
            { title: "电视", value: "shows" },
          ],
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
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      title: "Trakt片单",
      requiresWebView: false,
      functionName: "loadListItems",
      cacheDuration: 86400,
      params: [
        { name: "user_name", title: "用户名", type: "input" },
        { name: "list_name", title: "片单名", type: "input" },
        {
          name: "sort_by",
          title: "排序依据",
          type: "enumeration",
          enumOptions: [
            { title: "排名", value: "rank" },
            { title: "添加时间", value: "added" },
            { title: "标题", value: "title" },
            { title: "发布日期", value: "released" },
            { title: "时长", value: "runtime" },
            { title: "流行度", value: "popularity" },
            { title: "随机", value: "random" },
          ],
        },
        {
          name: "sort_how",
          title: "排序方向",
          type: "enumeration",
          enumOptions: [
            { title: "正序", value: "asc" },
            { title: "反序", value: "desc" },
          ],
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
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      title: "Trakt追剧日历",
      requiresWebView: false,
      functionName: "loadCalendarItems",
      cacheDuration: 43200,
      params: [
        { name: "cookie", title: "用户Cookie", type: "input" },
        {
          name: "start_date",
          title: "开始日期（相对）",
          type: "input",
        },
        { name: "days", title: "天数", type: "input" },
        {
          name: "order",
          title: "排序方式",
          type: "enumeration",
          enumOptions: [
            { title: "升序", value: "asc" },
            { title: "降序", value: "desc" },
          ],
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
      ],
    },
  ],
};


async function filterByTmdbJapanNetwork(imdbList, tmdbNetworkId) {
  if (!tmdbNetworkId || imdbList.length === 0) return imdbList;

  const filtered = [];
  for (const item of imdbList) {
    try {
      const tmdbUrl = `https://www.themoviedb.org/find/${item.id}?language=zh-CN`;
      const response = await Widget.http.get(tmdbUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const doc = Widget.dom.parse(response.data);
      const networkNodes = Widget.dom.select(doc, `.tooltip a[href*="/network/"]`);
      const networkIds = networkNodes
        .map(el => Widget.dom.attr(el, 'href'))
        .filter(Boolean)
        .map(href => href.match(/\/network\/(\d+)/)?.[1])
        .filter(Boolean);

      if (networkIds.includes(tmdbNetworkId)) {
        filtered.push(item);
      }
    } catch {}
  }
  return filtered;
}

function extractTraktUrlsFromResponse(responseData, minNum, maxNum, random = false) {
  let docId = Widget.dom.parse(responseData);
  let metaElements = Widget.dom.select(docId, 'meta[content^="https://trakt.tv/"]');
  if (!metaElements || metaElements.length === 0) throw new Error("未找到任何 meta content 链接");

  let traktUrls = Array.from(new Set(metaElements
    .map(el => el.getAttribute?.('content') || Widget.dom.attr(el, 'content'))
    .filter(Boolean)));
  if (random) {
    const shuffled = traktUrls.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(9, shuffled.length));
  } else {
    return traktUrls.slice(minNum - 1, maxNum);
  }
}

function extractTraktUrlsInProgress(responseData, minNum, maxNum) {
  let docId = Widget.dom.parse(responseData);
  let mainInfoElements = Widget.dom.select(docId, 'div.col-md-15.col-sm-8.main-info');
  if (!mainInfoElements || mainInfoElements.length === 0) throw new Error("未找到任何 main-info 元素");

  let traktUrls = [];
  mainInfoElements.slice(minNum - 1, maxNum).forEach(element => {
    let linkElement = Widget.dom.select(element, 'a[href^="/shows/"]')[0];
    if (!linkElement) return;

    let href = linkElement.getAttribute?.('href') || Widget.dom.attr(linkElement, 'href');
    if (!href) return;

    let progressElement = Widget.dom.select(element, 'div.progress.ticks')[0];
    let progressValue = progressElement
      ? parseInt(progressElement.getAttribute?.('aria-valuenow') || Widget.dom.attr(progressElement, 'aria-valuenow') || '0')
      : 0;

    if (progressValue !== 100) {
      let fullUrl = `https://trakt.tv${href}`;
      traktUrls.push(fullUrl);
    }
  });
  return Array.from(new Set(traktUrls));
}

async function fetchImdbIdsFromTraktUrls(traktUrls) {
  let imdbIdPromises = traktUrls.map(async (url) => {
    try {
      let detailResponse = await Widget.http.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });

      let detailDoc = Widget.dom.parse(detailResponse.data);
      let imdbLinkEl = Widget.dom.select(detailDoc, 'a#external-link-imdb')[0];
      if (!imdbLinkEl) return null;

      let href = Widget.dom.attr(imdbLinkEl, 'href');
      let match = href.match(/title\/(tt\d+)/);
      return match ? `${match[1]}` : null;
    } catch {
      return null;
    }
  });

  let imdbIds = [...new Set(
    (await Promise.all(imdbIdPromises)).filter(Boolean)
  )].map((id) => ({ id, type: "imdb" }));

  return imdbIds;
}

async function fetchTraktData(url, headers = {}, status, minNum, maxNum, random = false, order = "") {
  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Expires": "0",
        ...headers,
      },
    });

    let traktUrls = status === "progress"
      ? extractTraktUrlsInProgress(response.data, minNum, maxNum)
      : extractTraktUrlsFromResponse(response.data, minNum, maxNum, random);

    if (order === "desc") traktUrls = traktUrls.reverse();

    return await fetchImdbIdsFromTraktUrls(traktUrls);
  } catch (error) {
    throw error;
  }
}

async function loadInterestItems(params = {}) {
  const page = params.page;
  const userName = params.user_name || "";
  let status = params.status || "";
  const random = status === "random_watchlist";
  if (random) status = "watchlist";
  const count = 20;
  const size = status === "watchlist" ? 6 : 3;
  const minNum = ((page - 1) % size) * count + 1;
  const maxNum = minNum + count - 1;
  const traktPage = Math.floor((page - 1) / size) + 1;
  if (!userName) throw new Error("必须提供 Trakt 用户名");
  if (random && page > 1) return [];

  const url = `https://trakt.tv/users/${userName}/${status}?page=${traktPage}`;
  let items = await fetchTraktData(url, {}, status, minNum, maxNum, random);

  if (params.japan_network) {
    items = await filterByTmdbJapanNetwork(items, params.japan_network);
  }
  return items;
}

async function loadSuggestionItems(params = {}) {
  const page = params.page;
  const cookie = params.cookie || "";
  const type = params.type || "";
  const count = 20;
  const minNum = (page - 1) * count + 1;
  const maxNum = minNum + count - 1;

  if (!cookie) throw new Error("必须提供用户Cookie");

  const url = `https://trakt.tv/${type}/recommendations`;
  let items = await fetchTraktData(url, { Cookie: cookie }, "", minNum, maxNum);

  if (params.japan_network) {
    items = await filterByTmdbJapanNetwork(items, params.japan_network);
  }
  return items;
}

async function loadListItems(params = {}) {
  const page = params.page;
  const userName = params.user_name || "";
  const listName = params.list_name || "";
  const sortBy = params.sort_by || "";
  const sortHow = params.sort_how || "";
  const count = 20;
  const minNum = ((page - 1) % 6) * count + 1;
  const maxNum = minNum + count - 1;
  const traktPage = Math.floor((page - 1) / 6) + 1;

  if (!userName || !listName) throw new Error("必须提供用户名和片单名");

  const url = `https://trakt.tv/users/${userName}/lists/${listName}?page=${traktPage}&sort=${sortBy},${sortHow}`;
  let items = await fetchTraktData(url, {}, "", minNum, maxNum);

  if (params.japan_network) {
    items = await filterByTmdbJapanNetwork(items, params.japan_network);
  }
  return items;
}

async function loadCalendarItems(params = {}) {
  const cookie = params.cookie || "";
  const startDateInput = params.start_date || "";
  const days = params.days || "";
  const order = params.order || "";
  if (!cookie || !startDateInput || !days || !order) throw new Error("缺少必要参数");

  const startDateOffset = parseInt(startDateInput, 10);
  if (isNaN(startDateOffset)) throw new Error("开始日期必须是数字");

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + startDateOffset);
  const formattedStartDate = startDate.toISOString().split('T')[0];

  const url = `https://trakt.tv/calendars/my/shows-movies/${formattedStartDate}/${days}`;
  let items = await fetchTraktData(url, { Cookie: cookie }, "", 1, 100, false, order);

  if (params.japan_network) {
    items = await filterByTmdbJapanNetwork(items, params.japan_network);
  }
  return items;
}
