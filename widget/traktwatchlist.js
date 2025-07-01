// forward.widgets.js
WidgetMetadata = {
  id: "Trakt",
  title: "Trakt我看&Trakt个性化推荐+TMDB平台筛选(无API Key版)",
  version: "1.0.13",
  requiredVersion: "0.0.1",
  description:
    "解析Trakt想看、在看、已看、片单、追剧日历、个性化推荐，支持按TMDB播放平台筛选(无API Key版)",
  author: "huangxd + ChatGPT",
  site: "https://github.com/huangxd-/ForwardWidgets",
  modules: [
    {
      title: "Trakt推荐 × TMDB平台筛选(无API Key)",
      requiresWebView: false,
      functionName: "loadSuggestionWithPlatform",
      cacheDuration: 43200,
      params: [
        {
          name: "cookie",
          title: "用户Cookie",
          type: "input",
          description:
            "_traktsession=xxxx，未填写情况下接口不可用；可登陆网页后，通过loon，Qx等软件抓包获取Cookie",
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
          name: "platform",
          title: "播放平台",
          type: "enumeration",
          enumOptions: [
            { title: "tvN", value: "4430" },
            { title: "KBS2", value: "147" },
            { title: "SBS", value: "79" },
            { title: "MBC", value: "98" },
            { title: "JTBC", value: "4344" },
            { title: "ENA", value: "174537" },
            { title: "TV Chosun", value: "1116" },
            { title: "Channel A", value: "1746" },
            { title: "OCN", value: "129506" },
            { title: "NHK", value: "2716" },
            { title: "Fuji TV", value: "2440" },
            { title: "NTV (日本电视台)", value: "328" },
            { title: "TBS", value: "291" },
            { title: "TV Tokyo", value: "233" },
            { title: "WOWOW", value: "318" },
            { title: "TV Asahi", value: "235" },
            { title: "Kansai TV", value: "2405" },
            { title: "Netflix", value: "213" },
            { title: "Amazon Prime Video", value: "1024" },
            { title: "Disney+", value: "337" },
            { title: "Hulu", value: "15" },
            { title: "HBO Max", value: "384" },
            { title: "Apple TV+", value: "350" },
            { title: "AMC", value: "174" },
            { title: "NBC", value: "6" },
            { title: "CBS", value: "16" },
            { title: "ABC", value: "2" },
            { title: "FX", value: "88" },
            { title: "The CW", value: "71" },
          ],
        },
        {
          name: "region",
          title: "地区代码",
          type: "enumeration",
          enumOptions: [
            { title: "台湾", value: "TW" },
            { title: "韩国", value: "KR" },
            { title: "日本", value: "JP" },
            { title: "美国", value: "US" },
          ],
        },
        {
          name: "year",
          title: "年份",
          type: "input",
          description: "如：2024，可选填",
        },
        { name: "page", title: "页码", type: "page" },
      ],
    },
  ],
};

// 辅助函数：IMDb ID -> TMDB ID + 类型
async function fetchTmdbIdAndTypeByImdbId(imdbId) {
  try {
    const url = `https://www.themoviedb.org/find/${imdbId}?language=zh-CN`;
    const resp = await Widget.http.get(url);
    const html = resp.data;
    const match = html.match(/href="\/(movie|tv)\/(\d+)[^"]*"/);
    if (!match) return null;
    return { tmdbId: match[2], mediaType: match[1] };
  } catch (e) {
    console.error("fetchTmdbIdAndTypeByImdbId error:", e, imdbId);
    return null;
  }
}

// 辅助函数：解析 TMDB 详情页（年份、评分、播放平台）
async function fetchTmdbDetailByHtml(tmdbId, mediaType, region) {
  try {
    const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=zh-CN`;
    const resp = await Widget.http.get(url);
    const html = resp.data;

    let year = null;
    let yearMatch = html.match(/<h2 class="title">[\s\S]*?\((\d{4})\)/);
    if (!yearMatch) yearMatch = html.match(/(\d{4})/);
    if (yearMatch) year = parseInt(yearMatch[1]);

    const voteMatch = html.match(/<meta name="twitter:data1" content="([\d\.]+) \/ 10"/);
    const voteAverage = voteMatch ? parseFloat(voteMatch[1]) : null;

    const networks = [];
    const networkRegex = /<a href="\/network\/(\d+)"[^>]*>/g;
    let matchNet;
    while ((matchNet = networkRegex.exec(html)) !== null) {
      networks.push(matchNet[1]);
    }

    return { year, voteAverage, networks };
  } catch (e) {
    console.error("fetchTmdbDetailByHtml error:", e, tmdbId, mediaType);
    return null;
  }
}

// 组合函数：IMDb ID 转 TMDB 并取详情
async function fetchTmdbAndImdbInfoWithoutApiKey(imdbId, region) {
  const idType = await fetchTmdbIdAndTypeByImdbId(imdbId);
  if (!idType) return null;
  const detail = await fetchTmdbDetailByHtml(idType.tmdbId, idType.mediaType, region);
  if (!detail) return null;
  return {
    imdbId,
    tmdbId: idType.tmdbId,
    mediaType: idType.mediaType,
    year: detail.year,
    voteAverage: detail.voteAverage,
    networks: detail.networks,
  };
}

// 从 Trakt 推荐页提取影视链接
function extractTraktUrlsFromResponse(html, minNum = 1, maxNum = 50) {
  const metaUrls = [];
  const regex = /https:\/\/trakt\.tv\/(movies|shows)\/[a-zA-Z0-9\-]+/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    metaUrls.push(match[0]);
  }
  return metaUrls.slice(minNum - 1, maxNum);
}

// 主函数：加载推荐并筛选播放平台
async function loadSuggestionWithPlatform(params = {}) {
  try {
    const cookie = params.cookie || "";
    const type = params.type || "";
    const platformId = params.platform || "";
    const region = params.region || "US";
    const yearFilter = params.year ? parseInt(params.year, 10) : null;
    const page = params.page || 1;

    if (!cookie) throw new Error("必须提供用户Cookie");
    if (!type) throw new Error("必须提供类型");
    if (!platformId) throw new Error("必须提供播放平台");

    const url = `https://trakt.tv/${type}/recommendations?page=${page}`;
    const headers = { Cookie: cookie };

    console.log(`[loadSuggestionWithPlatform] 请求 URL: ${url}`);
    const resp = await Widget.http.get(url, { headers });
    console.log(`[loadSuggestionWithPlatform] 返回状态: ${resp.status}`);

    const traktUrls = extractTraktUrlsFromResponse(resp.data, 1, 50);
    console.log(`[loadSuggestionWithPlatform] 抓取到 Trakt 影视链接数: ${traktUrls.length}`);

    const imdbIds = new Set();
    const batchSize = 5;

    for (let i = 0; i < traktUrls.length; i += batchSize) {
      const batch = traktUrls.slice(i, i + batchSize);
      console.log(`[loadSuggestionWithPlatform] 批量请求 Trakt 详情页，批次 ${i / batchSize + 1}, 条数 ${batch.length}`);

      const batchResults = await Promise.all(
        batch.map(async (url) => {
          try {
            const resp = await Widget.http.get(url);
            if (resp.status !== 200) {
              console.warn(`[loadSuggestionWithPlatform] 详情页非200状态: ${resp.status}，URL: ${url}`);
              return null;
            }
            const html = resp.data;
            const imdbMatch = html.match(/https?:\/\/www\.imdb\.com\/title\/(tt\d+)/);
            if (!imdbMatch) {
              console.warn(`[loadSuggestionWithPlatform] 未找到 IMDb ID，URL: ${url}`);
              return null;
            }
            return imdbMatch[1];
          } catch (err) {
            console.error(`[loadSuggestionWithPlatform] 请求 Trakt 详情页异常，URL: ${url}`, err.stack || err);
            return null;
          }
        })
      );

      batchResults.forEach((id) => id && imdbIds.add(id));
    }

    console.log(`[loadSuggestionWithPlatform] 总共抓取到 IMDb ID 数量: ${imdbIds.size}`);

    const filteredResults = [];
    let index = 0;
    for (const imdbId of imdbIds) {
      index++;
      try {
        console.log(`[loadSuggestionWithPlatform] 处理第${index}个 IMDb ID: ${imdbId}`);
        const info = await fetchTmdbAndImdbInfoWithoutApiKey(imdbId, region);
        if (!info) {
          console.warn(`[loadSuggestionWithPlatform] 未获取到 TMDB 信息，IMDb ID: ${imdbId}`);
          continue;
        }
        if (yearFilter && info.year !== yearFilter) {
          console.log(`[loadSuggestionWithPlatform] 跳过年份不符，IMDb ID: ${imdbId}, 年份: ${info.year}`);
          continue;
        }
        if (info.networks && info.networks.includes(platformId)) {
          filteredResults.push({
            id: imdbId,
            type: "imdb",
            tmdbId: info.tmdbId,
            mediaType: info.mediaType,
            year: info.year,
            rating: info.voteAverage,
          });
          console.log(`[loadSuggestionWithPlatform] 符合筛选条件，加入结果，IMDb ID: ${imdbId}`);
        } else {
          console.log(`[loadSuggestionWithPlatform] 不符合播放平台，IMDb ID: ${imdbId}`);
        }
      } catch (err) {
        console.error(`[loadSuggestionWithPlatform] 处理 IMDb ID 异常，IMDb ID: ${imdbId}`, err.stack || err);
      }
    }

    console.log(`[loadSuggestionWithPlatform] 返回结果数: ${filteredResults.length}`);
    return filteredResults;
  } catch (e) {
    console.error("[loadSuggestionWithPlatform] 重大错误:", e.stack || e);
    throw e;
  }
}

export { WidgetMetadata, loadSuggestionWithPlatform };
