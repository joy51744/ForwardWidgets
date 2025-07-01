// Trakt组件，仅保留「trakt我看」模块
WidgetMetadata = {
    id: "Trakt",
    title: "Trakt我看",
    version: "1.0.11",
    requiredVersion: "0.0.1",
    description: "解析Trakt想看、在看、已看的条目并提取IMDb ID（无需API Key）",
    author: "huangxd",
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
                        { title: "随机想看(从想看列表中无序抽取9个影片)", value: "random_watchlist" },
                    ],
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page"
                },
            ],
        },
    ]
};

// 提取 meta 标签中的 trakt 影视链接
function extractTraktUrlsFromResponse(responseData, minNum, maxNum, random = false) {
    let docId = Widget.dom.parse(responseData);
    let metaElements = Widget.dom.select(docId, 'meta[content^="https://trakt.tv/"]');
    if (!metaElements || metaElements.length === 0) throw new Error("未找到任何 meta content 链接");

    let traktUrls = Array.from(new Set(metaElements
        .map(el => el.getAttribute?.('content') || Widget.dom.attr(el, 'content'))
        .filter(Boolean)));

    return random
        ? traktUrls.sort(() => 0.5 - Math.random()).slice(0, Math.min(9, traktUrls.length))
        : traktUrls.slice(minNum - 1, maxNum);
}

// 提取正在看的条目中「未看完」的 Trakt 链接
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
            traktUrls.push(`https://trakt.tv${href}`);
        }
    });

    return Array.from(new Set(traktUrls));
}

// 从 Trakt 影视链接中抓 IMDb ID
async function fetchImdbIdsFromTraktUrls(traktUrls) {
    const imdbIdPromises = traktUrls.map(async (url) => {
        try {
            const res = await Widget.http.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Cache-Control": "no-cache",
                },
            });
            const doc = Widget.dom.parse(res.data);
            const imdbEl = Widget.dom.select(doc, 'a#external-link-imdb')[0];
            const href = imdbEl ? Widget.dom.attr(imdbEl, 'href') : null;
            const match = href?.match(/title\/(tt\d+)/);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    });

    return [...new Set((await Promise.all(imdbIdPromises)).filter(Boolean))].map(id => ({
        id,
        type: "imdb",
    }));
}

// 请求 Trakt 页面并抓取 IMDb ID
async function fetchTraktData(url, headers = {}, status, minNum, maxNum, random = false) {
    const response = await Widget.http.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            ...headers,
        },
    });

    let traktUrls = status === "progress"
        ? extractTraktUrlsInProgress(response.data, minNum, maxNum)
        : extractTraktUrlsFromResponse(response.data, minNum, maxNum, random);

    return await fetchImdbIdsFromTraktUrls(traktUrls);
}

// 主函数：trakt我看
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
    return await fetchTraktData(url, {}, status, minNum, maxNum, random);
}
