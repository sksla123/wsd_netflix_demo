<template>
  <div class="home-container" :class="{ 'mobile': isMobile }">
    <div class="home" :style="mobileStyle">
      <div class="banner-container animate-section">
        <MovieBanner v-if="popularMovies.length > 0" :movie="randomPopularMovie" />
      </div>

      <section class="movie-section animate-section">
        <h2>인기 영화</h2>
        <HorizontalSlide :movies="popularMovies" />
      </section>

      <section class="movie-section animate-section">
        <h2>현재 상영 중인 영화</h2>
        <HorizontalSlide :movies="nowPlayingMovies" />
      </section>

      <section class="movie-section animate-section">
        <h2>오늘의 추천 영화</h2>
        <h3>{{ subTitle }}: {{ selectedGenre }}</h3>
        <HorizontalSlide :movies="recommendedMovies" />
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import HorizontalSlide from './common/view/HorizontalSlide.vue';
import MovieBanner from './common/view/MovieBanner.vue';
import { getBaseMovieUrl, getMovieUrl, addExtraQuery2MovieUrl } from './common/api/url.js';
import { getMovieDatas, getResponse } from './common/api/api.js';

export default {
  name: 'Home',
  components: {
    HorizontalSlide,
    MovieBanner
  },
  props: {
    availableWidth: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const popularMovies = ref([]);
    const nowPlayingMovies = ref([]);
    const recommendedMovies = ref([]);
    const subTitle = ref('');
    const selectedGenre = ref('');

    const isMobile = computed(() => props.availableWidth <= 768);

    const mobileStyle = computed(() => {
      if (isMobile.value) {
        return { width: '100%' };
      }
      return { width: '80%' };
    });

    const randomPopularMovie = computed(() => {
      if (popularMovies.value.length > 0) {
        const randomIndex = Math.floor(Math.random() * popularMovies.value.length);

        if (popularMovies[randomIndex].id == 179387) {
          randomIndex = 0;
        }
        
        return popularMovies.value[randomIndex];
      }
      return null;
    });

    const fetchMovies = async (endpoint) => {
      const api_key = store.state.userAPIKey;
      const baseUrl = getMovieUrl(api_key, endpoint);
      const url = addExtraQuery2MovieUrl(baseUrl, "&include_adult=false");
      console.log(url);
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

    const selectRecommendedGenre = () => {
      const userEmail = store.state.userEmail;
      const userGenrePreference = JSON.parse(localStorage.getItem('UserGenrePreference')) || {};
      const userPreference = userGenrePreference[userEmail] || {};

      const allZero = Object.values(userPreference).every(([, count]) => count === 0);

      if (allZero) {
        subTitle.value = '웹사이트 추천';
        const randomGenreId = Object.keys(userPreference)[Math.floor(Math.random() * Object.keys(userPreference).length)];
        selectedGenre.value = userPreference[randomGenreId][0];
        return randomGenreId;
      } else {
        subTitle.value = '당신이 좋아하는 장르';
        const maxCount = Math.max(...Object.values(userPreference).map(([, count]) => count));
        const topGenres = Object.entries(userPreference).filter(([, [, count]]) => count === maxCount);
        const [selectedGenreId, [genreName]] = topGenres[Math.floor(Math.random() * topGenres.length)];
        selectedGenre.value = genreName;
        return selectedGenreId;
      }
    };

    const fetchRecommendedMovies = async (genreId) => {
      const api_key = store.state.userAPIKey;
      const baseUrl = getBaseMovieUrl(api_key, "/discover/movie");
      const url = addExtraQuery2MovieUrl(baseUrl, `&with_genres=${genreId}`);
      return await getMovieDatas(url);
    };

    const animateSections = () => {
      const sections = document.querySelectorAll('.animate-section');
      sections.forEach((section, index) => {
        setTimeout(() => {
          section.classList.add('animate');
        }, index * 200); // 각 섹션마다 200ms 간격으로 애니메이션 시작
      });
    };

    onMounted(async () => {
      popularMovies.value = await fetchMovies('/movie/popular');
      nowPlayingMovies.value = await fetchMovies('/movie/now_playing');

      const genres = await fetchGenres();
      updateUserGenrePreference(genres);
      updatePreferenceCounts();

      const recommendedGenreId = selectRecommendedGenre();
      recommendedMovies.value = await fetchRecommendedMovies(recommendedGenreId);

      // 모든 데이터가 로드된 후 애니메이션 시작
      animateSections();
    });

    return {
      isMobile,
      mobileStyle,
      popularMovies,
      nowPlayingMovies,
      recommendedMovies,
      randomPopularMovie,
      subTitle,
      selectedGenre
    };
  }
};
</script>

<style scoped>
.home-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.home {
  padding: 20px;
  margin-left: auto;
  margin-right: auto;
  overflow-x: hidden;
}

.home-container.mobile .home {
  width: 100%;
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
  margin-bottom: 10px;
  color: #fff;
  font-weight: bold;
}

h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #ccc;
}

.animate-section {
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.animate-section.animate {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1024px) {
  h2 {
    font-size: 32px;
  }

  h3 {
    font-size: 22px;
  }
}

@media (max-width: 768px) {
  .movie-section {
    margin-bottom: 40px;
  }

  h2 {
    font-size: 28px;
    margin-bottom: 8px;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 15px;
  }
}
</style>