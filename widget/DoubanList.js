WidgetMetadata = {
  id: "forward.combined.media.lists",
  title: "影视榜单",
  description: "基于Forw​​ardWidget架构导入豆瓣相关影视模块",
  author: "乔伊",
  site: "https://github.com/joy51744/FW-Widgets",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    // =============豆瓣模块=============
    // --- 🏆 精选榜单 ---
    {
      title: "豆瓣 Top 250 电影",
      description: "豆瓣评分最高的 250 部电影",
      requiresWebView: false,
      functionName: "loadDoubanCardItems",
      cacheDuration: 3600,
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://m.douban.com/subject_collection/movie_top250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "豆瓣自定义片单",
      description: "加载豆瓣官方榜单或用户豆列 (需输入 URL)",
      requiresWebView: false,
      functionName: "loadDoubanCardItems",
      cacheDuration: 3600,
      params: [
        {
          name: "url", 
          title: "🔗 列表地址", 
          type: "input", 
          description: "输入豆瓣片单或榜单地址 (subject_collection 或 doulist)",
          placeholders: [
            { title: "电影学院本科生必看100部", 
              value: "https://www.douban.com/doulist/108673/" },
            { title: "北京电影学院硕士要看的100部电影", 
              value: "https://www.douban.com/doulist/42564/" },
            { title: "柏林电影节片单", 
              value: "https://www.douban.com/doulist/161004180/" },
            { title: "第97届奥斯卡 (2025)", 
              value: "https://m.douban.com/subject_collection/EC7I7ZDRA?type=rank" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    
    // =============TMDB模块=============
    // --- 当前与趋势模块 ---
    {
        title: "TMDB 正在热映",
        description: "当前影院或流媒体上映的电影/剧集",
        requiresWebView: false,
        functionName: "tmdbNowPlaying",
        cacheDuration: 3600,
        params: [
            { 
                name: "type", 
                title: "🎭类型", 
                type: "enumeration", 
                enumOptions: [
                    { title: "电影", value: "movie" },
                    { title: "剧集", value: "tv" }
                ], 
                value: "movie" 
            },
            { name: "page", title: "页码", type: "page" },
            { name: "language", title: "语言", type: "language", value: "zh-CN" }
        ]
    },
    {
        title: "TMDB 本日热门",
        description: "今日热门电影与剧集",
        requiresWebView: false,
        functionName: "tmdbTrending",
        cacheDuration: 900,
        params: [
            { name: "time_window", 
              title: "时间", 
              type: "constant", 
              value: "day" },
            { name: "language", title: "语言", type: "constant", value: "zh-CN" },
            { name: "page", title: "页码", type: "page" }
        ]
    },
    {
        title: "TMDB 本周热门",
        description: "本周热门电影与剧集",
        requiresWebView: false,
        functionName: "tmdbTrending",
        cacheDuration: 900,
        params: [
            { name: "time_window", 
              title: "时间", 
              type: "constant", 
              value: "week" },
            { name: "language", title: "语言", type: "constant", value: "zh-CN" },
            { name: "page", title: "页码", type: "page" }
        ]
    },

    // --- 常规发现模块 ---
    {
        title: "TMDB 高分内容",
        description: "高分电影或剧集 (按用户评分排序)",
        requiresWebView: false,
        functionName: "tmdbTopRated",
        cacheDuration: 3600,
        params: [
            { 
                name: "type", 
                title: "🎭类型", 
                type: "enumeration", 
                enumOptions: [
                    { title: "电影", value: "movie" },
                    { title: "剧集", value: "tv" }
                ], 
                value: "movie" 
            },
            { name: "language", title: "语言", type: "language", value: "zh-CN" },
            { name: "page", title: "页码", type: "page" }
        ]
    },

    // --- 平台筛选模块---
    {
        title: "TMDB 播出平台",
        description: "按播出平台和内容类型筛选剧集内容",
        requiresWebView: false,
        functionName: "tmdbDiscoverByNetwork",
        cacheDuration: 3600,
        params: [
            {
                name: "with_networks",
                title: "播出平台",
                type: "enumeration",
                description: "选择一个平台以查看其剧集内容",
                value: "",
                belongTo: {
                  paramName: "air_status",
                  value: ["released","upcoming"],
                },
                enumOptions: [
                    { title: "全部", value: "" },
                    { title: "Tencent", value: "2007" },
                    { title: "iQiyi", value: "1330" },
                    { title: "Youku", value: "1419" },
                    { title: "Bilibili", value: "1605" },
                    { title: "MGTV", value: "1631" },
                    { title: "Netflix", value: "213" },
                    { title: "Disney+", value: "2739" },
                    { title: "HBO", value: "49" },
                    { title: "HBO Max", value: "3186" },
                    { title: "Apple TV+", value: "2552" },
                    { title: "Hulu", value: "453" },
                    { title: "Amazon Prime Video", value: "1024" },
                    { title: "FOX", value: "19" },
                    { title: "Paramount", value: "576" },
                    { title: "Paramount+", value: "4330" },
                    { title: "TV Tokyo", value: "94" },
                    { title: "BBC One", value: "332" },
                    { title: "BBC Two", value: "295" },
                    { title: "NBC", value: "6" },
                    { title: "AMC+", value: "174" },
                    { title: "We TV", value: "3732" },
                    { title: "Viu TV", value: "2146" },
                    { title: "TVB", value: "48" }
                ]
            },
            {
                name: "with_genres",
                title: "🎭内容类型",
                type: "enumeration",
                description: "选择要筛选的内容类型",
                value: "",
                belongTo: {
                  paramName: "air_status",
                  value: ["released","upcoming"],
                },
                enumOptions: [
                    { title: "全部类型", value: "" },
                    { title: "犯罪", value: "80" },
                    { title: "动画", value: "16" },
                    { title: "喜剧", value: "35" },
                    { title: "剧情", value: "18" },
                    { title: "家庭", value: "10751" },
                    { title: "儿童", value: "10762" },
                    { title: "悬疑", value: "9648" },
                    { title: "真人秀", value: "10764" },
                    { title: "脱口秀", value: "10767" },
                    { title: "肥皂剧", value: "10766" },
                    { title: "纪录片", value: "99" },
                    { title: "动作与冒险", value: "10759" },
                    { title: "科幻与奇幻", value: "10765" },
                    { title: "战争与政治", value: "10768" }
                ]
            },
            {
                name: "air_status",
                title: "上映状态",
                type: "enumeration",
                description: "默认已上映",
                value: "released",
                enumOptions: [
                    { title: "已上映", value: "released" },
                    { title: "未上映", value: "upcoming" }
                ]
            },
            {
                name: "sort_by",
                title: "🔢 排序方式",
                type: "enumeration",
                description: "选择内容排序方式,默认上映时间↓",
                value: "first_air_date.desc",
                enumOptions: [
                    { title: "上映时间↓", value: "first_air_date.desc" },
                    { title: "上映时间↑", value: "first_air_date.asc" },
                    { title: "人气最高", value: "popularity.desc" },
                    { title: "评分最高", value: "vote_average.desc" },
                    { title: "最多投票", value: "vote_count.desc" }
                ]
            },
            { name: "page", title: "页码", type: "page" },
            { name: "language", title: "语言", type: "language", value: "zh-CN" }
        ]
    },
    // --- 出品公司模块 ---
    {
      id: "companies",
      title: "TMDB 出品公司",
      functionName: "tmdbCompanies",
      cacheDuration: 3600,
      params: [
        {
          name: "with_companies",
          title: "出品公司",
          type: "enumeration",
          value: "",
          description: "选择一个公司以查看其剧集内容",
          belongTo: {
            paramName: "air_status",
            value: ["released","upcoming"],
          },
          enumOptions: [
            { title: "全部", value: "" },
            { title: "Disney", value: "2" },
            { title: "Warner Bros", value: "174" },
            { title: "Columbia", value: "5" },
            { title: "Sony", value: "34" },
            { title: "Universal", value: "33" },
            { title: "Paramount", value: "4" },
            { title: "20th Century", value: "25" },
            { title: "Marvel", value: "420" },
            { title: "Toho", value: "882" },
            { title: "中国电影集团公司", value: "14714" },
            { title: "BBC", value: "3324" },
            { title: "印度", value: "1569" },
            { title: "A24", value: "41077" },
            { title: "Blumhouse", value: "3172" },
            { title: "Working Title Films", value: "10163" }
          ]
        },
        {
          name: "with_genres",
          title: "🎭内容类型",
          type: "enumeration",
          description: "选择要筛选的内容类型",
          value: "",
          belongTo: {
            paramName: "air_status",
            value: ["released","upcoming"],
          },
          enumOptions: [
            { title: "全部类型", value: "" },
            { title: "冒险", value: "12" },
            { title: "剧情", value: "18" },
            { title: "动作", value: "28" },
            { title: "动画", value: "16" },
            { title: "历史", value: "36" },
            { title: "喜剧", value: "35" },
            { title: "奇幻", value: "14" },
            { title: "家庭", value: "10751" },
            { title: "恐怖", value: "27" },
            { title: "悬疑", value: "9648" },
            { title: "惊悚", value: "53" },
            { title: "战争", value: "10752" },
            { title: "爱情", value: "10749" },
            { title: "犯罪", value: "80" },
            { title: "科幻", value: "878" },
            { title: "记录", value: "99" },
            { title: "西部", value: "37" },
            { title: "音乐", value: "10402" },
            { title: "电视电影", value: "10770" }
          ]
        },
        {
          name: "air_status",
          title: "上映状态",
          type: "enumeration",
          description: "默认已上映",
          value: "released",
          enumOptions: [
            { title: "已上映", value: "released" },
            { title: "未上映", value: "upcoming" }
          ]
        },
        {
          name: "sort_by",
          title: "🔢 排序方式",
          type: "enumeration",
          description: "选择内容排序方式,默认上映时间↓",
          value: "primary_release_date.desc",
          enumOptions: [
            { title: "上映时间↓", value: "primary_release_date.desc" },
            { title: "上映时间↑", value: "primary_release_date.asc" },
            { title: "人气最高", value: "popularity.desc" },
            { title: "评分最高", value: "vote_average.desc" },
            { title: "最多投票", value: "vote_count.desc" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "language", title: "语言", type: "language", value: "zh-CN" }
      ]
    },

    // --- 高级筛选模块 ---
    {
        title: "TMDB 即将上映",
        description: "即将上映的电影 (可筛选)",
        requiresWebView: false,
        functionName: "tmdbUpcomingMovies",
        cacheDuration: 3600,
        params: [
            { name: "language", title: "语言", type: "language", value: "zh-CN" },
            { 
                name: "primary_release_date.gte", 
                title: "起始日期 (含)", 
                type: "input", 
                description: "格式：YYYY-MM-DD（默认今天）", 
                value: "",
                placeholder: "例：2023-12-31"
            },
            { 
                name: "primary_release_date.lte", 
                title: "结束日期 (含)", 
                type: "input", 
                description: "格式：YYYY-MM-DD（可选）", 
                value: "",
                placeholder: "例：2024-05-01"
            },
            { 
                name: "with_release_type", 
                title: "发行渠道", 
                type: "enumeration", 
                description: "选择发行渠道（多选用逗号分隔）", 
                value: "2,3",
                enumOptions: [ 
                    { title: "影院上映 (优先)", value: "2,3" },
                    { title: "全部渠道", value: "" }, 
                    { title: "数字发行", value: "4" }, 
                    { title: "实体发行", value: "5" }, 
                    { title: "电视播出", value: "6" }
                ] 
            },
            { 
                name: "with_genres", 
                title: "🎭类型筛选", 
                type: "enumeration", 
                description: "选择电影类型", 
                value: "",
                enumOptions: [ 
                    { title: "任意类型", value: "" }, 
                    { title: "动作", value: "28" }, 
                    { title: "冒险", value: "12" },
                    { title: "动画", value: "16" }, 
                    { title: "喜剧", value: "35" }, 
                    { title: "犯罪", value: "80" },
                    { title: "纪录", value: "99" }, 
                    { title: "剧情", value: "18" }, 
                    { title: "家庭", value: "10751" },
                    { title: "悬疑", value: "9648" }, 
                    { title: "爱情", value: "10749" },
                    { title: "科幻", value: "878" }, 
                    { title: "战争", value: "10752" },
                    { title: "西部", value: "37" }, 
                    { title: "电视电影", value: "10770" }
                ] 
            },
            { 
                name: "vote_average.gte", 
                title: "最低评分", 
                type: "input", 
                description: "输入0-10之间的数字（如7）", 
                value: "",
                placeholder: "0-10"
            },
            { 
                name: "vote_count.gte", 
                title: "最少评价数", 
                type: "input", 
                description: "输入最小评价数量", 
                value: "",
                placeholder: "如：100"
            },
            { 
                name: "with_keywords", 
                title: "关键词", 
                type: "input", 
                description: "英文关键词（如'superhero'）", 
                value: "",
                placeholder: "多个用逗号分隔"
            },
            { name: "page", title: "页码", type: "page" }
        ]
    },

    // =============IMDB模块=============
    {
      title: "IMDb Top 250 电影",
      description: "IMDb 用户评分最高的 250 部电影",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      cacheDuration: 3600,
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://www.imdb.com/chart/top/?ref_=nv_mv_250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "IMDb Top 250 剧集",
      description: "IMDb 用户评分最高的 250 部剧集",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      cacheDuration: 3600,
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    {
      title: "IMDB 自定义片单",
      description: "解析 IMDB 热门电影/剧集等网页片单 (需输入 URL)",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      cacheDuration: 3600,
      params: [
        {
          name: "url", 
          title: "🔗 列表地址", 
          type: "input", 
          description: "输入 IMDB 片单或榜单地址",
          placeholders: [
            { title: "时下热门电影", 
              value: "https://www.imdb.com/chart/moviemeter/?ref_=nv_mv_mpm" },
            { title: "时下热门剧集", 
              value: "https://www.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "20" }
      ]
    },
    }
  ]
};

// ===============辅助函数===============
function formatItemDescription(item) {
    let description = item.description || '';
    const hasRating = /评分|rating/i.test(description);
    const hasYear = /年份|year/i.test(description);
    
    if (item.rating && !hasRating) {
        description = `评分: ${item.rating} | ${description}`;
    }
    
    if (item.releaseDate && !hasYear) {
        const year = String(item.releaseDate).substring(0,4);
        if (/^\d{4}$/.test(year)) {
            description = `年份: ${year} | ${description}`;
        }
    }
    
    return description
        .replace(/^\|\s*/, '')
        .replace(/\s*\|$/, '')
        .trim();
}

function createErrorItem(id, title, error) {
    const errorMessage = String(error?.message || error || '未知错误');
    const uniqueId = `error-${id.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    return {
        id: uniqueId,
        type: "error",
        title: title || "加载失败",
        description: `错误详情：${errorMessage}`
    };
}

function calculatePagination(params) {
    let page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    
    if (typeof params.start !== 'undefined') {
        page = Math.floor(parseInt(params.start) / limit) + 1;
    }
    
    if (page < 1) page = 1;
    if (limit > 50) throw new Error("单页数量不能超过50");

    const start = (page - 1) * limit;
    return { page, limit, start };
}

function getBeijingDate() {
    const now = new Date();
    
    const beijingTime = now.getTime() + (8 * 60 * 60 * 1000);
    const beijingDate = new Date(beijingTime);
    
    const year = beijingDate.getUTCFullYear();
    const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingDate.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}
// ===============豆瓣功能函数===============
async function loadDoubanCardItems(params = {}) {
  try {
    const url = params.url;
    if (!url) throw new Error("缺少片单 URL");
    if (url.includes("douban.com/doulist/")) {
      return loadDoubanDefaultList(params);
    } else if (url.includes("douban.com/subject_collection/")) {
      return loadDoubanSubjectCollection(params);
    } else {
        throw new Error("不支持的豆瓣 URL 格式");
    }
  } catch (error) {
    console.error("解析豆瓣片单失败:", error);
    throw error;
  }
}

async function loadDoubanDefaultList(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const listId = url.match(/doulist\/(\d+)/)?.[1];
  if (!listId) throw new Error("无法从 URL 获取豆瓣豆列 ID");
  const pageUrl = `https://www.douban.com/doulist/${listId}/?start=${start}&sort=&playable=&sub_type=`;
  const response = await Widget.http.get(pageUrl, {
    headers: {
      Referer: `https://www.douban.com/`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });
  if (!response || !response.data) throw new Error("获取豆瓣豆列数据失败");
  const docId = Widget.dom.parse(response.data);
  if (docId < 0) throw new Error("解析豆瓣豆列 HTML 失败");
  const itemElements = Widget.dom.select(docId, "div.doulist-item");
  let fallbackItemElements = [];
  if (!itemElements || itemElements.length === 0) {
       const articleElement = Widget.dom.selectFirst(docId, ".article");
       if (articleElement >= 0) {
            fallbackItemElements = Widget.dom.select(articleElement, ".doulist-subject");
            if (!fallbackItemElements || fallbackItemElements.length === 0) {
                 fallbackItemElements = Widget.dom.select(articleElement, "li.subject-item");
            }
       }
  }
  const finalItemElements = (itemElements && itemElements.length > 0) ? itemElements : fallbackItemElements;
  if (!finalItemElements || finalItemElements.length === 0) {
      const paging = Widget.dom.selectFirst(docId, ".paginator .next a");
      if (paging < 0) {
          return [];
      } else {
           return [];
      }
  }
  let doubanIds = [];
  for (const itemId of finalItemElements) {
       let titleElementId = Widget.dom.selectFirst(itemId, ".title a");
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, ".item-title a");
       }
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, "a[onclick*='subject']");
       }
      if (titleElementId >= 0) {
          const link = await Widget.dom.attr(titleElementId, "href");
          const idMatch = link ? link.match(/subject\/(\d+)/) : null;
          const title = await Widget.dom.text(titleElementId);
          if (idMatch && idMatch[1]) {
              let coverUrl = "";
              let imgElementId = Widget.dom.selectFirst(itemId, ".post img");
              if (imgElementId < 0) {
                 imgElementId = Widget.dom.selectFirst(itemId, ".item-poster img");
              }
              if (imgElementId >= 0) {
                  coverUrl = await Widget.dom.attr(imgElementId, "src");
                   if (coverUrl) {
                       coverUrl = coverUrl.replace(/\/(s|m|sq)\//, '/l/');
                   }
              }
              let description = "";
              let abstractElementId = Widget.dom.selectFirst(itemId, ".abstract");
              if (abstractElementId < 0) {
                  abstractElementId = Widget.dom.selectFirst(itemId, ".card-abstract");
              }
               if (abstractElementId >= 0) {
                   description = await Widget.dom.text(abstractElementId);
                   description = description.trim().replace(/\n\s*/g, ' ');
               }
              let rating = undefined;
              let ratingElementId = Widget.dom.selectFirst(itemId, ".rating .rating_nums");
              if (ratingElementId < 0) {
                  ratingElementId = Widget.dom.selectFirst(itemId, ".item-rating .rating_nums");
              }
              if (ratingElementId >= 0) {
                  rating = await Widget.dom.text(ratingElementId);
                  rating = rating.trim();
              }
              doubanIds.push({
                  id: idMatch[1],
                  type: "douban",
                  title: title ? title.trim() : "未知标题",
                  coverUrl: coverUrl || undefined,
                  description: formatItemDescription({
                      description: description || undefined,
                      rating: rating,
                      releaseDate: item.releaseDate
                  }),
                  rating: rating ? parseFloat(rating) : undefined
                });
          } else {
             console.warn("解析豆列项时未找到 subject ID, Title:", title, "Link:", link);
          }
      } else {
         console.warn("在豆列项中未找到标题链接元素, Item ID:", itemId);
      }
  }
  return doubanIds;
}

async function loadDoubanItemsFromApi(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const apiUrl = `${url}?start=${start}&count=${limit}&updated_at&items_only=1&for_mobile=1`;
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  const referer = listIdMatch ? `https://m.douban.com/subject_collection/${listIdMatch[1]}/` : 'https://m.douban.com/';
  const response = await Widget.http.get(apiUrl, {
    headers: {
      Referer: referer,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });
  if (response.data && response.data.subject_collection_items) {
    const items = response.data.subject_collection_items;
    const doubanIds = items.map((item) => ({
      id: item.id,
      type: "douban",
      title: item.title,
      coverUrl: item.cover?.url,
      description: formatItemDescription({
          description: item.card_subtitle || item.description,
          rating: item.rating?.value,
          releaseDate: item.year
      }),
      rating: item.rating?.value,
      releaseDate: item.year
    }));
    return doubanIds;
  }
  return [];
}

async function loadDoubanSubjectCollection(params = {}) {
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  if (!listIdMatch) throw new Error("无法从 URL 获取豆瓣合集 ID");
  const listId = listIdMatch[1];
  const { start, limit } = calculatePagination(params);
  const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${listId}/items`;
  return await loadDoubanItemsFromApi({
      ...params,
      url: apiUrl,
  });
}

async function loadDoubanRecommendMovies(params = {}) {
  return await loadDoubanRecommendItems(params, "movie");
}

async function loadDoubanRecommendShows(params = {}) {
  return await loadDoubanRecommendItems(params, "tv");
}

async function loadDoubanRecommendItems(params = {}, mediaType = "movie") {
  const { start, limit } = calculatePagination(params);
  const category = params.category || "";
  const subType = params.type || "";
  const tags = params.tags || "";
  const sortBy = params.sort_by || "T";
  const encodedTags = encodeURIComponent(tags);
  
  let url;
  if (category === "全部" || category === "all") {
    url = `https://m.douban.com/rexxar/api/v2/${mediaType}/recommend?refresh=0&start=${start}&count=${limit}&selected_categories=${encodeURIComponent(JSON.stringify(params.selected_categories || {}))}&uncollect=false&score_range=0,10`;
    if (encodedTags) url += `&tags=${encodedTags}`;
    url += `&sort=${sortBy}`; 
  } else {
    url = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${mediaType}?start=${start}&count=${limit}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(subType)}&sort=${sortBy}`;
  }

  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://movie.douban.com/explore`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });

  const items = response.data?.subjects || response.data?.items || [];
  return items.map((item) => {
    const rating = item.rating?.value || (item.rate ? parseFloat(item.rate) : undefined);
    const releaseYear = item.year || item.release_date?.substring(0, 4);
    const cover = item.cover?.url || item.pic?.normal;
    
    let dynamicDesc = "";
    switch(sortBy) {
      case "U":
        dynamicDesc = "近期热度排序";
        break;
      case "R":
        dynamicDesc = `首映时间: ${releaseYear || '未知'}`;
        break;
      case "S":
        dynamicDesc = `评分: ${rating?.toFixed(1) || '无'}`;
        break;
      default: // T
        dynamicDesc = item.card_subtitle || item.description || "";
    }

    return {
      id: String(item.id),
      type: "douban",
      title: item.title,
      coverUrl: cover,
      description: formatItemDescription({
        description: dynamicDesc,
        rating: rating,
        releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
      }),
      rating: rating,
      releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
    };
  });
}

//===============TMDB功能函数===============
async function fetchTmdbData(api, params) {
    try {
        const response = await Widget.tmdb.get(api, { params: params });

        if (!response) {
            throw new Error("获取数据失败");
        }

        const data = response.results;
        
        return data
            .filter(item => {
                const hasPoster = item.poster_path;
                const hasTitle = item.title || item.name;
                const hasValidId = Number.isInteger(item.id);
                
                return hasPoster && hasTitle && hasValidId;
            })
            .map((item) => {
                let mediaType = item.media_type;
                
                if (!mediaType) {
                    if (item.title) mediaType = "movie";
                    else if (item.name) mediaType = "tv";
                }
                
                return {
                    id: item.id,
                    type: "tmdb",
                    title: item.title || item.name,
                    description: item.overview,
                    releaseDate: item.release_date || item.first_air_date,
                    backdropPath: item.backdrop_path,
                    posterPath: item.poster_path,
                    rating: item.vote_average,
                    mediaType: mediaType || "unknown",
                };
            });
    } catch (error) {
        console.error("调用 TMDB API 失败:", error);
        return [createErrorItem("tmdb-api", "API调用失败", error)];
    }
}


async function tmdbNowPlaying(params) {
    const type = params.type || 'movie';
    const api = type === 'movie' ? "movie/now_playing" : "tv/on_the_air";
    return await fetchTmdbData(api, params);
}

async function tmdbTrending(params) {
  const timeWindow = params.time_window;
  const api = `trending/all/${timeWindow}`;
  delete params.time_window;
  return await fetchTmdbData(api, params);
}


async function tmdbTopRated(params) {
    const type = params.type || 'movie';
    const api = type === 'movie' ? `movie/top_rated` : `tv/top_rated`;
    return await fetchTmdbData(api, params);
}

async function tmdbUpcomingMovies(params) {
    const api = "discover/movie";
    const beijingDate = getBeijingDate();
    const discoverParams = {
        language: params.language || 'zh-CN',
        page: params.page || 1,
        sort_by: 'primary_release_date.asc',
        'primary_release_date.gte': params['primary_release_date.gte'] || beijingDate,
        with_release_type: params.with_release_type || '2,3'
    };
    
    if (params['primary_release_date.lte']) {
        discoverParams['primary_release_date.lte'] = params['primary_release_date.lte'];
    }
    if (params.with_genres) {
        discoverParams.with_genres = params.with_genres;
    }
    if (params['vote_average.gte']) {
        discoverParams['vote_average.gte'] = params['vote_average.gte'];
    }
    if (params['vote_count.gte']) {
        discoverParams['vote_count.gte'] = params['vote_count.gte'];
    }
    if (params.with_keywords) {
        discoverParams.with_keywords = params.with_keywords;
    }
    
    return await fetchTmdbData(api, discoverParams);
}

async function tmdbDiscoverByNetwork(params = {}) {
    const api = "discover/tv";
    const beijingDate = getBeijingDate();
    const discoverParams = {
        language: params.language || 'zh-CN',
        page: params.page || 1,
        with_networks: params.with_networks,
        sort_by: params.sort_by || "first_air_date.desc",
    };
    
    if (params.air_status === 'released') {
        discoverParams['first_air_date.lte'] = beijingDate;
    } else if (params.air_status === 'upcoming') {
        discoverParams['first_air_date.gte'] = beijingDate;
    }
    
    if (params.with_genres) {
        discoverParams.with_genres = params.with_genres;
    }
    
    return await fetchTmdbData(api, discoverParams);
}

async function tmdbCompanies(params = {}) {
    try {
        const api = "discover/movie";
        const beijingDate = getBeijingDate();
        const withCompanies = String(params.with_companies || '').trim();

        const cleanParams = {
            page: params.page || 1,
            language: params.language || "zh-CN",
            sort_by: params.sort_by || "primary_release_date.desc",
            include_adult: false,
            include_video: false
        };

        if (withCompanies) {
            cleanParams.with_companies = withCompanies;
        }

        if (params.air_status === 'released') {
            cleanParams['primary_release_date.lte'] = beijingDate;
        } else if (params.air_status === 'upcoming') {
            cleanParams['primary_release_date.gte'] = beijingDate;
        }

        if (params.with_genres) {
            cleanParams.with_genres = String(params.with_genres).trim();
        }

        return await fetchTmdbData(api, cleanParams);
    } catch (error) {
        console.error('公司数据加载失败:', error);
        return [createErrorItem('companies', '数据加载失败', error)];
    }
}

//===============IMDB功能函数===============
async function loadImdbCardItems(params = {}) {
  const url = params.url;
  if (!url) throw new Error("缺少 IMDB 片单 URL");
  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    },
  });
  if (!response || !response.data) throw new Error("获取 IMDB 片单数据失败");
  const videoIds = [];
  const ldJsonMatch = response.data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ldJsonMatch && ldJsonMatch[1]) {
      try {
          const json = JSON.parse(ldJsonMatch[1]);
          if (json && json.itemListElement && Array.isArray(json.itemListElement)) {
              for (const item of json.itemListElement) {
                  if (item && item.item && item.item.url) {
                      const idMatch = item.item.url.match(/(tt\d+)/);
                      if (idMatch && idMatch[1]) {
                          videoIds.push({
                              id: idMatch[1],
                              type: "imdb",
                              title: item.item.name || "Unknown Title",
                              coverUrl: item.item.image || undefined,
                          });
                      }
                  }
              }
          }
      } catch (e) {
          console.warn("解析 LD+JSON 失败:", e);
      }
  }
  if (videoIds.length === 0) {
      const docId = Widget.dom.parse(response.data);
      if (docId < 0) throw new Error("解析 IMDB HTML 失败");
      const itemElementIds = Widget.dom.select(docId, "ul.ipc-metadata-list > li, .lister-list > tr");
      for (const itemId of itemElementIds) {
          try {
              const linkElementId = Widget.dom.selectFirst(itemId, ".ipc-title__text, .titleColumn a");
              let link = "";
              let title = "";
              if (linkElementId >= 0) {
                  const titleText = await Widget.dom.text(linkElementId);
                  title = titleText ? titleText.replace(/^\d+\.\s*/, '').trim() : "Unknown Title";
                  const titleLinkElementId = Widget.dom.selectFirst(itemId, "a.ipc-title-link-wrapper, .titleColumn a");
                   if (titleLinkElementId >= 0) {
                       link = await Widget.dom.attr(titleLinkElementId, "href");
                   }
              }
              if (link) {
                  const idMatch = link.match(/(tt\d+)/);
                  if (idMatch && idMatch[1]) {
                      let coverUrl = "";
                      const imgElementId = Widget.dom.selectFirst(itemId, ".ipc-poster img, .posterColumn img");
                      if (imgElementId >= 0) {
                          coverUrl = await Widget.dom.attr(imgElementId, "src");
                          if (coverUrl && coverUrl.startsWith('//')) coverUrl = 'https:' + coverUrl;
                          if (coverUrl) coverUrl = coverUrl.replace(/\/(c|g|s)\//, '/l/');
                      }
                      videoIds.push({
                          id: idMatch[1],
                          type: "imdb",
                          title: title || "Unknown Title",
                          coverUrl: coverUrl || undefined,
                          description: ""
                        });
                  }
              }
          } catch (parseError) {
              console.error("IMDB 解析错误:", parseError);
          }
      }
  }
  const { start, limit } = calculatePagination(params);
  const end = start + limit;
  return videoIds.slice(start, end);
}
