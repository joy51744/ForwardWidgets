// 组件元数据
WidgetMetadata = {
    id: "Trakt",
    title: "Trakt我看&Trakt个性化推荐",
    modules: [
        // ... 省略前面模块，重点展示Trakt个性化推荐模块 ...
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
                    description: "_traktsession=xxxx，未填写情况下接口不可用；可登陆网页后，通过loon，Qx等软件抓包获取Cookie",
                },
                {
                    name: "type",
                    title: "类型",
                    type: "enumeration",
                    enumOptions: [
                        {
                            title: "电影",
                            value: "movies",
                        },
                        {
                            title: "电视",
                            value: "shows",
                        },
                    ],
                },
                {
                    name: "region",
                    title: "地区",
                    type: "enumeration",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "美国", value: "us" },
                        { title: "日本", value: "jp" },
                        { title: "韩国", value: "kr" },
                    ],
                    description: "筛选指定地区的推荐内容",
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page"
                },
                
                {
                    name: "platform",
                    title: "播放平台",
                    type: "enumeration",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "Netflix", value: "Netflix" },
                        { title: "Hulu", value: "Hulu" },
                        { title: "Amazon Prime", value: "Amazon Prime" },
                        { title: "Disney+", value: "Disney+" },
                        { title: "HBO", value: "HBO" },
                        { title: "HBO Max", value: "HBO Max" },
                        { title: "Paramount+", value: "Paramount+" },
                        { title: "HBO", value: "HBO" },
                        { title: "Peacock", value: "Peacock" },
                        { title: "HBO", value: "HBO" },
                        { title: "Starz", value: "Starz" },
                    ],
                    description: "筛选指定播放平台的内容",
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                },
            ],
        },
        // ... 其他模块 ...
    ],
    version: "1.0.12",
    requiredVersion: "0.0.1",
    description: "解析Trakt想看、在看、已看、片单、追剧日历以及根据个人数据生成的个性化推荐【五折码：CHEAP.5;七折码：CHEAP】",
    author: "huangxd",
    site: "https://github.com/huangxd-/ForwardWidgets"
};

// 抓取并解析推荐，按地区筛选
async function loadSuggestionItems(params = {}) {
    try {
        const page = params.page || 1;
        const cookie = params.cookie || "";
        const type = params.type || "";
        const region = params.region || "";

        const count = 20;
        const minNum = (page - 1) * count;
        const maxNum = page * count;

        if (!cookie) {
            throw new Error("必须提供用户Cookie");
        }

        let url = `https://trakt.tv/${type}/recommendations`;

        const response = await Widget.http.get(url, {
            headers: {
                Cookie: cookie,
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        let doc = Widget.dom.parse(response.data);

        // 选择所有推荐条目，视具体页面调整选择器
        let items = Widget.dom.select(doc, '.recommendations .recommendation');

        if (!items || items.length === 0) {
            throw new Error("未找到推荐内容");
        }

        // 按页码切片
        let pageItems = items.slice(minNum, maxNum);

        // 地区关键词映射
        const regionMap = {
            us: ["USA", "United States", "美国"],
            jp: ["Japan", "日本"],
            kr: ["Korea", "韩国"],
        };

        if (region && region !== "") {
            const keywords = regionMap[region] || [];

            pageItems = pageItems.filter(item => {
                // 这里示范获取地区信息的元素，需根据真实页面结构修改
                let countryText = "";
                let countryEls = Widget.dom.select(item, '.country');
                if (countryEls && countryEls.length > 0) {
                    countryText = countryEls[0].textContent || "";
                }

                // 也可以从标题或描述中搜索
                let titleEl = Widget.dom.select(item, '.title')?.[0];
                let titleText = titleEl ? titleEl.textContent : "";

                return keywords.some(kw => countryText.includes(kw) || titleText.includes(kw));
            });
        }

        // 提取 IMDb ID
        let imdbIds = await Promise.all(pageItems.map(async (item) => {
            let linkEl = Widget.dom.select(item, 'a[href*="imdb.com/title/"]')[0];
            if (!linkEl) return null;
            let href = linkEl.getAttribute('href');
            let match = href.match(/title\/(tt\d+)/);
            return match ? { id: match[1], type: "imdb" } : null;
        }));

        return imdbIds.filter(Boolean);

    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}
