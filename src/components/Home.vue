<template>
  <div class="home">
    <section class="movie-section">
      <h2>인기 영화</h2>
      <HorizontalSlide :movies="popularMovies" />
    </section>

    <section class="movie-section">
      <h2>현재 상영 중인 영화</h2>
      <HorizontalSlide :movies="nowPlayingMovies" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import HorizontalSlide from './common/view/HorizontalSlide.vue';
import { getMovieUrl } from './common/api/url.js';
import { getMovieDatas } from './common/api/api.js';

const store = useStore();
const popularMovies = ref([]);
const nowPlayingMovies = ref([]);

const fetchMovies = async (endpoint) => {
  const api_key = store.state.userAPIKey;
  const url = getMovieUrl(api_key, endpoint);
  return await getMovieDatas(url);
};

onMounted(async () => {
  popularMovies.value = await fetchMovies('/movie/popular');
  nowPlayingMovies.value = await fetchMovies('/movie/now_playing');
});
</script>

<style scoped>
.home {
    padding: 20px;
    width: 85%;
    margin-left: auto;
    margin-right: auto;
}

.movie-section {
    margin-bottom: 40px;
}

h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #fff;
}

@media (max-width: 768px) {
    .home {
        width: 100%;
    }
}
</style>