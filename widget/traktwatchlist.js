WidgetMetadata = {
  id: "Trakt",
  title: "Trakt我看+地区筛选",
  version: "1.0.12",
  requiredVersion: "0.0.1",
  description: "解析Trakt我看（想看/在看/已看/随机），支持地区筛选",
  author: "Forward",
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
          description: "需在Trakt设置里打开隐私开关，未填写情况下接口不可用",
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
            { title: "随机想看(无序抽取9个)", value: "random_watchlist" },
          ],
        },
        {
          name: "countries",
          title: "地区",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "日本", value: "JP" },
            { title: "韩国", value: "KR" },
            { title: "美国", value: "US" },
          ],
          description: "通过TMDb网页解析判断Network地区(免API Key)",
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

// 区域网络ID映射（TMDb Network ID）
const networkRegionMap = {
  JP: [2716, 2440, 328, 291, 233, 2077,37,4627], // NHK, Fuji TV, NTV, TBS, TV Tokyo, WOWOW,TV Asahi,BS Fuji
  KR: [4430, 147, 2148,79, 98, 4344, 1748, 129506,1934,3843], // tvN, KBS2, KBS1,SBS, MBC, JTBC, ENA, OCN,Channel A,TV Chosun
  US: [2, 7, 9, 13, 14, 16, 21, 1024,174,213,88,71,67,318,30,4324,2076,2552,453,1024,2739,387,68,14], // NBC, ABC, CBS, FOX,AMC,Netflix,FX,The CW,Showtime,Starz,USA Network,Peacock,Paramount+,Apple TV+,Hulu,Amazon Prime Video,Disney+,HBO Max,TBS,PBS
};

// TMDb 网页抓取 Network ID（无需 API Key）
async function fetchNetworkIdFromTmdb(imdbId) {
  try {
    const findUrl = `https://www.themoviedb.org/find/${imdbId}`;
    const resp = await Widget.http.get(findUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const doc = Widget.dom.parse(resp.data);
    const detailLink = Widget.dom.select(doc, 'a.result[href*="/tv/"]')[0]
      || Widget.dom.select(doc, 'a.result[href*="/movie/"]')[0];
    if (!detailLink) return [];

    const href = Widget.dom.attr(detailLink, "href");
    const detailResp = await Widget.http.get(`https://www.themoviedb.org${href}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const detailDoc = Widget.dom.parse(detailResp.data);
    const networkEls = Widget.dom.select(detailDoc, 'span.network a[href^="/network/"]');

    return networkEls.map(el => {
      const href = Widget.dom.attr(el, "href");
      const match = href.match(/\/network\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }).filter(Boolean);
  } catch {
    return [];
  }
}

async function filterByRegion(imdbList, region) {
  const targetIds = networkRegionMap[region] || [];
  if (!region || targetIds.length === 0) return imdbList;

  const result = [];

  for (const item of imdbList) {
    const netIds = await fetchNetworkIdFromTmdb(item.id);
    if (netIds.some(id => targetIds.includes(id))) {
      result.push(item);
    }
  }

  return result;
}

function extractTraktUrlsFromResponse(responseData, minNum, maxNum, random = false) {
  const docId = Widget.dom.parse(responseData);
  const metaElements = Widget.dom.select(docId, 'meta[content^="https://trakt.tv/"]');
  if (!metaElements || metaElements.length === 0) throw new Error("未找到 Trakt 内容");

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
  const docId = Widget.dom.parse(responseData);
  const mainInfoElements = Widget.dom.select(docId, 'div.col-md-15.col-sm-8.main-info');

  if (!mainInfoElements || mainInfoElements.length === 0) throw new Error("未找到 main-info 元素");

  const traktUrls = [];
  mainInfoElements.slice(minNum - 1, maxNum).forEach(element => {
    const linkElement = Widget.dom.select(element, 'a[href^="/shows/"]')[0];
    const href = linkElement && (linkElement.getAttribute?.('href') || Widget.dom.attr(linkElement, 'href'));
    const progressElement = Widget.dom.select(element, 'div.progress.ticks')[0];
    const progressValue = progressElement
      ? parseInt(progressElement.getAttribute?.('aria-valuenow') || Widget.dom.attr(progressElement, 'aria-valuenow') || '0')
      : 0;

    if (href && progressValue !== 100) {
      traktUrls.push(`https://trakt.tv${href}`);
    }
  });

  return Array.from(new Set(traktUrls));
}

async function fetchImdbIdsFromTraktUrls(traktUrls) {
  const imdbIdPromises = traktUrls.map(async (url) => {
    try {
      const detailResp = await Widget.http.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });
      const doc = Widget.dom.parse(detailResp.data);
      const imdbEl = Widget.dom.select(doc, 'a#external-link-imdb')[0];
      const href = imdbEl && Widget.dom.attr(imdbEl, 'href');
      const match = href?.match(/tt\d+/);
      return match ? match[0] : null;
    } catch {
      return null;
    }
  });

  return [...new Set((await Promise.all(imdbIdPromises)).filter(Boolean))].map(id => ({ id, type: "imdb" }));
}

async function fetchTraktData(url, headers = {}, status, minNum, maxNum, random = false) {
  const response = await Widget.http.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      ...headers,
    },
  });

  let traktUrls = [];
  if (status === "progress") {
    traktUrls = extractTraktUrlsInProgress(response.data, minNum, maxNum);
  } else {
    traktUrls = extractTraktUrlsFromResponse(response.data, minNum, maxNum, random);
  }

  return await fetchImdbIdsFromTraktUrls(traktUrls);
}

async function loadInterestItems(params = {}) {
  const page = params.page || 1;
  const userName = params.user_name || "";
  let status = params.status || "";
  const region = params.region || "";
  const random = status === "random_watchlist";
  if (random) status = "watchlist";

  if (!userName) throw new Error("必须提供 Trakt 用户名");
  if (random && page > 1) return [];

  const count = 20;
  const size = status === "watchlist" ? 6 : 3;
  const minNum = ((page - 1) % size) * count + 1;
  const maxNum = ((page - 1) % size) * count + 20;
  const traktPage = Math.floor((page - 1) / size) + 1;
  const url = `https://trakt.tv/users/${userName}/${status}?page=${traktPage}`;

  let imdbList = await fetchTraktData(url, {}, status, minNum, maxNum, random);

  if (region) {
    imdbList = await filterByRegion(imdbList, region);
  }

  return imdbList;
}
