const WidgetMetadata = {
  id: "forward.tmdb",
  title: "TMDB 播出平台",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "获取 TMDB 上各大平台播出剧集",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "networks",
      title: "播出平台",
      functionName: "networks",
      params: [
        {
          name: "with_networks",
          title: "播出平台",
          type: "enumeration",
          enumOptions: [
            { title: "Netflix", value: "213" },
            { title: "Disney+", value: "2739" },
            { title: "Apple TV+", value: "2552" },
            { title: "HBO Max", value: "3186" },
            { title: "Hulu", value: "453" },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
        {
          name: "language",
          title: "语言",
          type: "language",
          value: "zh-CN",
        },
      ],
    },
  ],
};

// 基础获取 TMDB 数据方法
async function fetchData(api, params, forceMediaType) {
  try {
    const response = await Widget.tmdb.get(api, { params: params });

    if (!response) {
      throw new Error("获取数据失败");
    }

    const data = response.results;
    const result = data.map((item) => {
      let mediaType = item.media_type;
      if (forceMediaType) {
        mediaType = forceMediaType;
      } else if (mediaType == null) {
        mediaType = item.title ? "movie" : "tv";
      }
      return {
        id: item.id,
        type: "tmdb",
        title: item.title ?? item.name,
        description: item.overview,
        releaseDate: item.release_date ?? item.first_air_date,
        backdropPath: item.backdrop_path,
        posterPath: item.poster_path,
        rating: item.vote_average,
        mediaType: mediaType,
      };
    });

    return result;
  } catch (error) {
    console.error("调用 TMDB API 失败:", error);
    throw error;
  }
}

// 播出平台模块处理函数
async function networks(params) {
  const api = `discover/tv`;
  return await fetchData(api, params);
}
