const WidgetMetadata = {
  id: "imdbList",
  title: "IMDb 片單",
  description: "解析 IMDb 片單頁面，顯示列表內容，無需 API Key",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  author: "Joey",
  site: "https://github.com/joy51744/ForwardWidgets",
  requiresWebView: false,
  cacheDuration: 3600,
  params: [
    {
      name: "url",
      title: "IMDb List 網址",
      type: "input",
      description: "請輸入 IMDb 片單頁面網址，例如：https://www.imdb.com/list/lsXXXXX/",
      required: true,
    },
  ],
};

async function loadListItems(params) {
  const url = params.url;
  if (!url || !url.includes("imdb.com/list/")) {
    throw new Error("請輸入有效的 IMDb List 網址");
  }

  // 取得 HTML 頁面
  const res = await fetch(url);
  if (!res.ok) throw new Error(`無法取得列表頁面，狀態碼：${res.status}`);
  const html = await res.text();

  // 解析 HTML (用 DOMParser 或正規表達式)
  // IMDb list 頁面中每個條目在 <div class="lister-item mode-detail"> 裡
  // 每個項目包含 <a href="/title/ttXXXXXXX/"> 的 IMDb ID

  const items = [];
  const itemRegex = /<div class="lister-item mode-detail">([\s\S]*?)<\/div>\s*<\/div>/g;
  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const itemHtml = match[1];

    // 取得 IMDb ID
    const idMatch = itemHtml.match(/\/title\/(tt\d{7,8})\//);
    if (!idMatch) continue;
    const imdbId = idMatch[1];

    // 取得標題
    const titleMatch = itemHtml.match(/<h3[^>]*>\s*<a[^>]*>([^<]+)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim() : "未知標題";

    // 取得年份（可選）
    const yearMatch = itemHtml.match(/<span class="lister-item-year text-muted unbold">([^<]+)<\/span>/);
    const year = yearMatch ? yearMatch[1].replace(/[^\d]/g, "") : "";

    // 取得海報 URL
    const posterMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
    const poster = posterMatch ? posterMatch[1] : "";

    items.push({
      imdbId,
      title,
      year,
      poster,
    });
  }

  // ForwardWidgets 結構輸出
  return items.map((it) => ({
    id: it.imdbId,
    title: it.title,
    year: it.year,
    image: it.poster,
    url: `https://www.imdb.com/title/${it.imdbId}/`,
  }));
}

export { WidgetMetadata, loadListItems };
