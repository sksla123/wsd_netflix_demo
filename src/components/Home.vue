<template>
  <div class="home" :class="{ 'mobile': isMobile }" :style="mobileStyle">
    <div class="banner-container">
      <MovieBanner v-if="popularMovies.length > 0" :movie="randomPopularMovie" />
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
import { getBaseMovieUrl, getMovieUrl } from './common/api/url.js';
import { getMovieDatas, getResponse } from './common/api/api.js';

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

const randomPopularMovie = computed(() => {
  if (popularMovies.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * popularMovies.value.length);
    return popularMovies.value[randomIndex];
  }
  return null;
});

const fetchMovies = async (endpoint) => {
  const api_key = store.state.userAPIKey;
  const url = getMovieUrl(api_key, endpoint);
  return await getMovieDatas(url);
};

const fetchGenres = async () => {
  const api_key = store.state.userAPIKey;
  const url = getBaseMovieUrl(api_key, "/genre/movie/list");
  const response = await getResponse(url);
  return response.data.genres;
};

const updateUserGenrePreference = (genres) => {
  const userEmail = store.state.userEmail;
  let userGenrePreference = JSON.parse(localStorage.getItem('UserGenrePreference')) || {};

  if (!userGenrePreference[userEmail]) {
    userGenrePreference[userEmail] = {};
  }

  genres.forEach(genre => {
    if (!userGenrePreference[userEmail][genre.id]) {
      userGenrePreference[userEmail][genre.id] = [genre.name, 0];
    }
  });

  localStorage.setItem('UserGenrePreference', JSON.stringify(userGenrePreference));
};

const updatePreferenceCounts = () => {
  const userEmail = store.state.userEmail;
  const userWishlist = JSON.parse(localStorage.getItem('UserWishlist')) || {};
  let userGenrePreference = JSON.parse(localStorage.getItem('UserGenrePreference')) || {};

  if (userWishlist[userEmail]) {
    Object.values(userWishlist[userEmail]).forEach(movie => {
      movie.genreIds.forEach(genreId => {
        if (userGenrePreference[userEmail][genreId]) {
          userGenrePreference[userEmail][genreId][1]++;
        }
      });
    });
  }

  localStorage.setItem('UserGenrePreference', JSON.stringify(userGenrePreference));
};

onMounted(async () => {
  popularMovies.value = await fetchMovies('/movie/popular');
  nowPlayingMovies.value = await fetchMovies('/movie/now_playing');

  const genres = await fetchGenres();
  updateUserGenrePreference(genres);
  updatePreferenceCounts();
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