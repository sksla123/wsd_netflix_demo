<template>
  <div class="home">
    <div class="banner-container">
      <MovieBanner v-if="popularMovies.length > 0" :movie="popularMovies[0]" />
    </div>

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
import MovieBanner from './common/view/MovieBanner.vue';
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
html, body {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

.home {
  padding: 20px;
  width: 85%;
  margin-left: auto;
  margin-right: auto;
  overflow-x: hidden;
}

.banner-container {
  margin-bottom: 40px;
  max-width: 100%;
}

.movie-section {
  margin-bottom: 60px;
  max-width: 100%;
}

h2 {
  font-size: 36px;
  margin-bottom: 30px;
  color: #fff;
  font-weight: bold;
}

@media (max-width: 1024px) {
  h2 {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .home {
    width: 100%;
    padding: 15px;
  }

  .movie-section {
    margin-bottom: 40px;
  }

  h2 {
    font-size: 28px;
    margin-bottom: 20px;
  }
}
</style>