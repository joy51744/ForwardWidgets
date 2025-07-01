const JAPAN_NETWORKS = [2716, 2440, 328, 291, 233, 318, 235, 2405];
const KOREA_NETWORKS = [3562, 3351, 1749, 3771, 1246, 3353, 3206, 5262, 213];
const US_NETWORKS = [
  213, 8, 9, 14, 49, 67, 28, 50, 2, 69, 85, 1024, 97
];

const WidgetMetadata = {
  id: "forward.traktWithNetworkFilterYear",
  title: "Trakt我看 + 播放平台筛选 + 年份筛选（日/韩/美）",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "基于 Trakt 和 TMDb 网页解析，支持日剧、韩剧、美剧播放平台和年份筛选，无需 API Key",
  author: "Forward & ChatGPT",
  site: "https://github.com/huangxd-/ForwardWidgets",
  modules: [
    {
      title: "trakt我看（含播放平台筛选与年份筛选）",
      requiresWebView: false,
      functionName: "loadInterestItems",
      cacheDuration: 3600,
      params: [
        { name: "user_name", title: "用户名", type: "input", description: "Trakt 用户名，必填" },
        {
          name: "status",
          title: "状态",
          type: "enumeration",
          enumOptions: [
            { title: "想看", value: "watchlist" },
            { title: "在看", value: "progress" },
            { title: "看过-电影", value: "history/movies/added/asc" },
            { title: "看过-电视", value: "history/shows/added/asc" },
            { title: "随机想看(想看列表随机9个)", value: "random_watchlist" }
          ]
        },
        {
          name: "platform_filter",
          title: "播放平台筛选",
          type: "enumeration",
          enumOptions: [
            { title: "不筛选", value: "none" },
            { title: "日本电视台", value: "japan" },
            { title: "韩国电视台", value: "korea" },
            { title: "美国电视台/平台", value: "us" }
          ],
          defaultValue: "none",
          description: "根据播放平台筛选显示内容"
        },
        {
          name: "year",
          title: "年份筛选（留空表示不筛选）",
          type: "input",
          description: "只显示指定年份上映的电影/剧集"
        },
        { name: "page", title: "页码", type: "page" }
      ],
    }
  ],

  async fetchTmdbNetworksFromHtml(tmdbId, type) {
    let url = `https://www.themoviedb.org/${type}/${tmdbId}`;
    try {
      let response = await Widget.http.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      let doc = Widget.dom.parse(response.data);
      let networkElements = Widget.dom.select(doc, 'ul.networks li a');
      if (!networkElements || networkElements.length === 0) return [];
      let networks = [];
      for (let el of networkElements) {
        let href = el.getAttribute('href') || Widget.dom.attr(el, 'href');
        if (!href) continue;
        let match = href.match(/\/network\/(\d+)-/);
        if (match) networks.push(parseInt(match[1], 10));
      }
      return networks;
    } catch {
      return [];
    }
  },

  // 新增：抓取并返回 imdbId, tmdbId, type, year（上映年份）
  async fetchDetailsWithTmdbInfo(traktUrl) {
    try {
      let detailResponse = await Widget.http.get(traktUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      let detailDoc = Widget.dom.parse(detailResponse.data);
      let imdbLinkEl = Widget.dom.select(detailDoc, 'a#external-link-imdb')[0];
      let tmdbLinkEl = Widget.dom.select(detailDoc, 'a#external-link-tmdb')[0];
      if (!imdbLinkEl || !tmdbLinkEl) return null;
      let imdbMatch = (imdbLinkEl.getAttribute('href') || "").match(/title\/(tt\d+)/);
      let tmdbHref = tmdbLinkEl.getAttribute('href') || "";
      let tmdbMatch = tmdbHref.match(/\/(movie|tv)\/(\d+)/);
      if (!imdbMatch || !tmdbMatch) return null;

      // 抓年份，电影取上映日期年份，剧集取首播年份
      let year = null;
      try {
        if (tmdbMatch[1] === 'movie') {
          let releaseDateEl = Widget.dom.select(detailDoc, 'section#main div.header span.release_date')[0];
          if (releaseDateEl) {
            let dateText = (releaseDateEl.textContent || releaseDateEl.innerText || "").trim();
            let y = dateText.match(/\d{4}/);
            if (y) year = parseInt(y[0], 10);
          }
        } else if (tmdbMatch[1] === 'tv') {
          let firstAirEl = Widget.dom.select(detailDoc, 'section#main div.header span.first_air_date')[0];
          if (firstAirEl) {
            let dateText = (firstAirEl.textContent || firstAirEl.innerText || "").trim();
            let y = dateText.match(/\d{4}/);
            if (y) year = parseInt(y[0], 10);
          }
        }
      } catch {}

      return { imdbId: imdbMatch[1], tmdbId: tmdbMatch[2], type: tmdbMatch[1], year };
    } catch {
      return null;
    }
  },

  async fetchAndFilterByNetworksAndYear(traktUrl, filterNetworkIds = [], filterYear = null) {
    let info = await this.fetchDetailsWithTmdbInfo(traktUrl);
    if (!info) return null;

    // 年份筛选
    if (filterYear && info.year !== filterYear) return null;

    let networks = await this.fetchTmdbNetworksFromHtml(info.tmdbId, info.type);
    if (!networks || networks.length === 0) return null;
    let matched = filterNetworkIds.length === 0 || networks.some(netId => filterNetworkIds.includes(netId));
    return matched ? { id: info.imdbId, type: "imdb" } : null;
  },

  async fetchImdbIdsFromTraktUrlsWithNetworkFilterAndYear(traktUrls, filterNetworkIds = [], filterYear = null) {
    let promises = traktUrls.map(url => this.fetchAndFilterByNetworksAndYear(url, filterNetworkIds, filterYear));
    let results = await Promise.all(promises);
    return [...new Set(results.filter(Boolean))];
  },

  extractTraktUrlsFromResponse(responseData, minNum, maxNum, random = false) {
    let docId = Widget.dom.parse(responseData);
    let metaElements = Widget.dom.select(docId, 'meta[content^="https://trakt.tv/"]');
    if (!metaElements || metaElements.length === 0) throw new Error("未找到任何 meta content 链接");
    let traktUrls = Array.from(new Set(metaElements.map(el => el.getAttribute?.('content') || Widget.dom.attr(el, 'content')).filter(Boolean)));
    if (random) {
      const shuffled = traktUrls.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(9, shuffled.length));
    } else {
      return traktUrls.slice(minNum - 1, maxNum);
    }
  },

  extractTraktUrlsInProgress(responseData, minNum, maxNum) {
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
        traktUrls.push(`https://trakt.tv${href}`);
      }
    });
    return Array.from(new Set(traktUrls));
  },

  async fetchImdbIdsFromTraktUrls(traktUrls) {
    let imdbIdPromises = traktUrls.map(async (url) => {
      try {
        let detailResponse = await Widget.http.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        let detailDoc = Widget.dom.parse(detailResponse.data);
        let imdbLinkEl = Widget.dom.select(detailDoc, 'a#external-link-imdb')[0];
        if (!imdbLinkEl) return null;
        let href = imdbLinkEl.getAttribute('href');
        let match = href.match(/title\/(tt\d+)/);
        return match ? { id: match[1], type: "imdb" } : null;
      } catch {
        return null;
      }
    });
    let imdbIds = [...new Set((await Promise.all(imdbIdPromises)).filter(Boolean))];
    return imdbIds;
  },

  async fetchTraktData(url, headers = {}, status, minNum, maxNum, random = false, order = "", filterNetworkIds = [], filterYear = null) {
    try {
      const response = await Widget.http.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          ...headers,
        },
      });

      let traktUrls = [];
      if (status === "progress") {
        traktUrls = this.extractTraktUrlsInProgress(response.data, minNum, maxNum);
      } else {
        traktUrls = this.extractTraktUrlsFromResponse(response.data, minNum, maxNum, random);
      }

      if (order === "desc") traktUrls = traktUrls.reverse();

      if (filterNetworkIds.length > 0 || filterYear !== null) {
        return await this.fetchImdbIdsFromTraktUrlsWithNetworkFilterAndYear(traktUrls, filterNetworkIds, filterYear);
      } else {
        return await this.fetchImdbIdsFromTraktUrls(traktUrls);
      }
    } catch (e) {
      console.error("fetchTraktData error:", e);
      throw e;
    }
  },

  async loadInterestItems(params = {}) {
    const page = params.page || 1;
    const userName = params.user_name || "";
    let status = params.status || "";
    const random = status === "random_watchlist";
    if (random) status = "watchlist";

    if (!userName) throw new Error("必须提供 Trakt 用户名");
    if (random && page > 1) return [];

    const count = 20;
    const size = status === "watchlist" ? 6 : 3;
    const minNum = ((page - 1) % size) * count + 1;
    const maxNum = ((page - 1) % size) * count + 20;
    const traktPage = Math.floor((page - 1) / size) + 1;

    let url = `https://trakt.tv/users/${userName}/${status}?page=${traktPage}`;

    let filterNetworkIds = [];
    switch (params.platform_filter) {
      case "japan": filterNetworkIds = JAPAN_NETWORKS; break;
      case "korea": filterNetworkIds = KOREA_NETWORKS; break;
      case "us": filterNetworkIds = US_NETWORKS; break;
      case "none":
      default:
        filterNetworkIds = [];
    }

    let filterYear = null;
    if (params.year) {
      const y = parseInt(params.year, 10);
      if (!isNaN(y)) filterYear = y;
    }

    return await this.fetchTraktData(url, {}, status, minNum, maxNum, random, "", filterNetworkIds, filterYear);
  },
};
