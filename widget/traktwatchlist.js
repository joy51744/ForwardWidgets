// Trakt组件完整代码，包含原有模块和新增的播放网络一周播出清单

WidgetMetadata = {
    id: "Trakt",
    title: "Trakt 播放平台一周播出清单",
    version: "1.1.0",
    requiredVersion: "1.1.0",
    description: "Trakt 播放平台一周播出清单",
    author: "Joy",
    site: "https://github.com/joy51744/ForwardWidgets",
    modules: [
        // 1. trakt我看模块
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
                { name: "page", title: "页码", type: "page" },
            ],
        },
        // 2. Trakt个性化推荐模块
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
                    description: "_traktsession=xxxx，未填写情况下接口不可用；可登录网页后，通过loon，Qx等软件抓包获取Cookie",
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
                { name: "page", title: "页码", type: "page" },
            ],
        },
        // 3. Trakt片单模块
        {
            title: "Trakt片单",
            requiresWebView: false,
            functionName: "loadListItems",
            cacheDuration: 86400,
            params: [
                { name: "user_name", title: "用户名", type: "input", description: "如：giladg，未填写情况下接口不可用" },
                { name: "list_name", title: "片单列表名", type: "input", description: "如：latest-4k-releases，未填写情况下接口不可用" },
                {
                    name: "sort_by",
                    title: "排序依据",
                    type: "enumeration",
                    enumOptions: [
                        { title: "排名算法", value: "rank" },
                        { title: "添加时间", value: "added" },
                        { title: "标题", value: "title" },
                        { title: "发布日期", value: "released" },
                        { title: "内容时长", value: "runtime" },
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
                { name: "page", title: "页码", type: "page" },
            ],
        },
        // 4. Trakt追剧日历模块
        {
            title: "Trakt追剧日历",
            requiresWebView: false,
            functionName: "loadCalendarItems",
            cacheDuration: 43200,
            params: [
                {
                    name: "cookie",
                    title: "用户Cookie",
                    type: "input",
                    description: "_traktsession=xxxx，未填写情况下接口不可用；可登录网页后，通过loon，Qx等软件抓包获取Cookie",
                },
                {
                    name: "start_date",
                    title: "开始日期：n天前（0表示今天，-1表示昨天，1表示明天）",
                    type: "input",
                    description: "0表示今天，-1表示昨天，1表示明天，未填写情况下接口不可用",
                },
                {
                    name: "days",
                    title: "天数",
                    type: "input",
                    description: "如：7，会返回从开始日期起的7天内的节目，未填写情况下接口不可用",
                },
                {
                    name: "order",
                    title: "排序方式",
                    type: "enumeration",
                    enumOptions: [
                        { title: "日期升序", value: "asc" },
                        { title: "日期降序", value: "desc" },
                    ],
                },
            ],
        },
        // 5. 新增：Trakt指定播放网络一周播出清单
        {
            title: "Trakt指定播放网络一周播出清单",
            requiresWebView: false,
            functionName: "loadNetworkCalendarItems",
            cacheDuration: 43200,
            params: [
                {
                    name: "cookie",
                    title: "用户Cookie",
                    type: "input",
                    description: "_traktsession=xxxx，必填",
                },
                {
                    name: "start_date",
                    title: "开始日期：n天前（0今天，-1昨天，1明天）",
                    type: "input",
                    description: "必填",
                },
                {
                    name: "days",
                    title: "天数",
                    type: "input",
                    description: "必填，如7",
                },
                {
                    name: "order",
                    title: "排序方式",
                    type: "enumeration",
                    enumOptions: [
                        { title: "日期升序", value: "asc" },
                        { title: "日期降序", value: "desc" },
                    ],
                },
                {
                    name: "network_name",
                    title: "播放网络名称",
                    type: "input",
                    description: "如 hbo, cbs, fox",
                },
            ],
        },
    ],
};

// -- 以下为所有辅助函数和业务逻辑 --

function extractTraktUrlsFromResponse(responseData, minNum, maxNum, random = false) {
    let docId = Widget.dom.parse(responseData);
    let metaElements = Widget.dom.select(docId, 'meta[content^="https://trakt.tv/"]');
    if (!metaElements || metaElements.length === 0) {
        throw new Error("未找到任何 meta content 链接");
    }

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

    if (!mainInfoElements || mainInfoElements.length === 0) {
        throw new Error("未找到任何 main-info 元素");
    }

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
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
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
        (await Promise.all(imdbIdPromises))
            .filter(Boolean)
            .map((item) => item)
    )].map((id) => ({
        id,
        type: "imdb",
    }));

    return imdbIds;
}

async function fetchTraktData(url, headers = {}, status, minNum, maxNum, random = false, order = "") {
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
            traktUrls = extractTraktUrlsInProgress(response.data, minNum, maxNum);
        } else {
            traktUrls = extractTraktUrlsFromResponse(response.data, minNum, maxNum, random);
        }

        if (order === "desc") {
            traktUrls = traktUrls.reverse();
        }

        return await fetchImdbIdsFromTraktUrls(traktUrls);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

// 原有功能函数...

async function loadInterestItems(params = {}) {
    try {
        const page = params.page || 1;
        const userName = params.user_name || "";
        let status = params.status || "";
        const random = status === "random_watchlist";
        if (random) status = "watchlist";

        const count = 20;
        const size = status === "watchlist" ? 6 : 3;
        const minNum = ((page - 1) % size) * count + 1;
        const maxNum = ((page - 1) % size) * count + 20;
        const traktPage = Math.floor((page - 1) / size) + 1;

        if (!userName) throw new Error("必须提供 Trakt 用户名");

        if (random && page > 1) return [];

        let url = `https://trakt.tv/users/${userName}/${status}?page=${traktPage}`;
        return await fetchTraktData(url, {}, status, minNum, maxNum, random);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

async function loadSuggestionItems(params = {}) {
    try {
        const page = params.page || 1;
        const cookie = params.cookie || "";
        const type = params.type || "";
        const count = 20;
        const minNum = (page - 1) * count + 1;
        const maxNum = page * count;

        if (!cookie) throw new Error("必须提供用户Cookie");

        let url = `https://trakt.tv/${type}/recommendations`;
        return await fetchTraktData(url, { Cookie: cookie }, "", minNum, maxNum);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

async function loadListItems(params = {}) {
    try {
        const page = params.page || 1;
        const userName = params.user_name || "";
        const listName = params.list_name || "";
        const sortBy = params.sort_by || "";
        const sortHow = params.sort_how || "";
        const count = 20;
        const minNum = ((page - 1) % 6) * count + 1;
        const maxNum = ((page - 1) % 6) * count + 20;
        const traktPage = Math.floor((page - 1) / 6) + 1;

        if (!userName || !listName) throw new Error("必须提供 Trakt 用户名 和 片单列表名");

        let url = `https://trakt.tv/users/${userName}/lists/${listName}?page=${traktPage}&sort=${sortBy},${sortHow}`;
        return await fetchTraktData(url, {}, "", minNum, maxNum);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

async function loadCalendarItems(params = {}) {
    try {
        const cookie = params.cookie || "";
        const startDateInput = params.start_date || "";
        const days = params.days || "";
        const order = params.order || "";

        if (!cookie || !startDateInput || !days || !order) {
            throw new Error("必须提供用户Cookie、开始日期、天数及排序方式");
        }

        const startDateOffset = parseInt(startDateInput, 10);
        if (isNaN(startDateOffset)) throw new Error("开始日期必须是有效的数字");

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + startDateOffset);

        const formattedStartDate = startDate.toISOString().split('T')[0];
        let url = `https://trakt.tv/calendars/my/shows-movies/${formattedStartDate}/${days}`;

        return await fetchTraktData(url, { Cookie: cookie }, "", 1, 100, false, order);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

// 新增函数：指定播放网络一周播出清单
async function loadNetworkCalendarItems(params = {}) {
    try {
        const cookie = params.cookie || "";
        const startDateInput = params.start_date || "";
        const days = params.days || "";
        const order = params.order || "";
        const networkName = params.network_name || "";

        if (!cookie || !startDateInput || !days || !order || !networkName) {
            throw new Error("必须提供用户Cookie、开始日期、天数、排序方式和播放网络名称");
        }

        const startDateOffset = parseInt(startDateInput, 10);
        if (isNaN(startDateOffset)) {
            throw new Error("开始日期必须是有效的数字");
        }

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + startDateOffset);
        const formattedStartDate = startDate.toISOString().split('T')[0];

        // 调用Trakt日历接口
        let url = `https://trakt.tv/calendars/my/shows-movies/${formattedStartDate}/${days}`;

        const response = await Widget.http.get(url, {
            headers: { Cookie: cookie }
        });

        let data = JSON.parse(response.data);

        // 过滤出播放网络包含networkName的节目
        let filteredItems = data.filter(item => {
            let networks = [];

            if (item.show) {
                if (Array.isArray(item.show.networks)) {
                    networks = item.show.networks.map(n => n.toLowerCase());
                } else if (typeof item.show.network === "string") {
                    networks = [item.show.network.toLowerCase()];
                }
            }

            return networks.some(net => net.includes(networkName.toLowerCase()));
        });

        if (order === "desc") filteredItems = filteredItems.reverse();

        const result = filteredItems.map(item => {
            let imdbId = null;
            let type = null;

            if (item.show && item.show.ids && item.show.ids.imdb) {
                imdbId = item.show.ids.imdb;
                type = "imdb";
            } else if (item.movie && item.movie.ids && item.movie.ids.imdb) {
                imdbId = item.movie.ids.imdb;
                type = "imdb";
            }

            return {
                id: imdbId,
                type,
                title: item.show ? item.show.title : (item.movie ? item.movie.title : ""),
                aired: item.first_aired || item.release_date || "",
                traktData: item,
            };
        }).filter(i => i.id);

        return result;
    } catch (error) {
        console.error("loadNetworkCalendarItems 处理失败:", error);
        throw error;
    }
}
