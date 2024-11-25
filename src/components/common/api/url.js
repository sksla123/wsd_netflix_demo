export function getBaseMovieUrl(api_key, end_point = "/movie/now_playing") {
    const baseUrl = "https://api.themoviedb.org/3";
    const url = `${baseUrl}${end_point}?api_key=${api_key}&language=ko-KR`;

    return url;
}

export function getMovieUrl(api_key, end_point = "/movie/now_playing", page = 1) {
    const baseUrl = getBaseMovieUrl(api_key, end_point)
    const url = `${baseUrl}page=${page}`;

    return url;
}

export function getMovieImageUrl(i_url, i_size = "original") {
    const baseUrl = "http://image.tmdb.org/t/p/";
    return `${baseUrl}${i_size}${i_url}`;
}