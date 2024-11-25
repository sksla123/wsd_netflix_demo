<template>
  <div class="home" :class="{ 'mobile': isMobile }" :style="mobileStyle">
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
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import HorizontalSlide from './common/view/HorizontalSlide.vue';
import MovieBanner from './common/view/MovieBanner.vue';
import { getMovieUrl } from './common/api/url.js';
import { getMovieDatas } from './common/api/api.js';

const props = defineProps({
  availableWidth: {
    type: Number,
    required: true
  }
});

const isMobile = computed(() => props.availableWidth <= 768);

const mobileStyle = computed(() => {
  if (isMobile.value) {
    return { maxWidth: `${props.availableWidth}px` };
  }
  return {};
});

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
  margin-left: auto;
  margin-right: auto;
  overflow-x: hidden;
}

.home.mobile {
  padding: 15px;
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
  .movie-section {
    margin-bottom: 40px;
  }

  h2 {
    font-size: 28px;
    margin-bottom: 20px;
  }
}
</style>