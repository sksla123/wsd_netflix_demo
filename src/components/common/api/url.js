import { useStore } from 'vuex';

export function getMovieUrl(end_point = "/movie/now_playing", page = 1) {
  const store = useStore();
  const api_key = store.state.userAPIKey;

  const baseUrl = "https://api.themoviedb.org/3";
  const url = `${baseUrl}${end_point}?api_key=${api_key}&language=ko-KR&page=${page}`;

  return url;
}
