<template>
  <div class="popular-container">
    <!-- 검색 바 컨테이너 -->
    <div class="container search-container">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="영화 검색..." />
        <i class="pi pi-search"></i>
      </div>
    </div>

    <!-- 필터 컨테이너 -->
    <div class="container filter-container">
      <div class="filter-buttons">
        <button @click="toggleFilter" class="filter-toggle" :class="{ active: showFilter }">필터</button>
        <button @click="resetFilter" class="filter-reset">초기화</button>
      </div>
      <div v-if="showFilter" class="filter-dropdown">
        <!-- 평점 필터 -->
        <div class="filter-section">
          <h3>평점: {{ star_start.toFixed(1) }} - {{ star_end.toFixed(1) }}</h3>
          <div class="range-slider-container">
            <div class="range-slider">
              <div class="range-slider-track"></div>
              <div class="range-slider-thumb start" :style="{ left: `${(star_start / 10) * 100}%` }"></div>
              <div class="range-slider-thumb end" :style="{ left: `${(star_end / 10) * 100}%` }"></div>
              <input type="range" min="0" max="10" step="0.1" v-model.number="star_start" @input="updateRating('start')">
              <input type="range" min="0" max="10" step="0.1" v-model.number="star_end" @input="updateRating('end')">
            </div>
            <div class="range-marks">
              <span v-for="i in 11" :key="i" class="range-mark">{{ i - 1 }}</span>
            </div>
          </div>
        </div>

        <!-- 장르 필터 -->
        <div class="filter-section">
          <h3>장르:</h3>
          <div class="genre-buttons">
            <button @click="toggleGenre('all')" :class="{ active: selected_genre_ids.length === 0 }">전체</button>
            <button v-for="genre in genres" :key="genre.id" @click="toggleGenre(genre.id)" 
                    :class="{ active: selected_genre_ids.includes(genre.id) }">
              {{ genre.name }}
            </button>
          </div>
        </div>

        <!-- 언어 필터 -->
        <div class="filter-section">
          <h3>언어:</h3>
          <div class="language-buttons">
            <button @click="selectLanguage('ko')" :class="{ active: selectedLanguage === 'ko' }">한국어</button>
            <button @click="selectLanguage('en')" :class="{ active: selectedLanguage === 'en' }">영어</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지 테이블 컨테이너 -->
    <div class="container page-table-container" :class="{ 'pushed-down': showFilter }">
      <PageTable :baseURL="baseURL" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { getBaseMovieUrl, addExtraQuery2MovieUrl } from './common/api/url';
import { getResponse } from './common/api/api';
import PageTable from './common/view/PageTable.vue';

const store = useStore();
const searchQuery = ref('');
const selected_genre_ids = ref([]);
const selectedLanguage = ref('ko');
const genres = ref([]);
const showFilter = ref(false);

const star_start = ref(0);
const star_end = ref(10);

const apiKey = computed(() => store.state.userAPIKey);

const baseURL = computed(() => {
  let url = getBaseMovieUrl(apiKey.value, '/discover/movie');
  
  if (selected_genre_ids.value.length > 0) {
    url = addExtraQuery2MovieUrl(url, `&with_genres=${selected_genre_ids.value.join(',')}`);
  }

  url = addExtraQuery2MovieUrl(url, `&with_original_language=${selectedLanguage.value}`);
  url = addExtraQuery2MovieUrl(url, `&vote_average.gte=${star_start.value}&vote_average.lte=${star_end.value}`);

  return url;
});

const toggleFilter = () => {
  showFilter.value = !showFilter.value;
  if (showFilter.value) {
    resetFilter();
  }
};

const resetFilter = () => {
  star_start.value = 0;
  star_end.value = 10;
  selected_genre_ids.value = [];
  selectedLanguage.value = 'ko';
};

const toggleGenre = (genreId) => {
  if (genreId === 'all') {
    selected_genre_ids.value = [];
  } else {
    const index = selected_genre_ids.value.indexOf(genreId);
    if (index > -1) {
      selected_genre_ids.value.splice(index, 1);
    } else {
      selected_genre_ids.value.push(genreId);
    }
  }
};

const selectLanguage = (lang) => {
  selectedLanguage.value = lang;
};

const updateRating = (type) => {
  if (type === 'start' && star_start.value > star_end.value) {
    star_start.value = star_end.value;
  } else if (type === 'end' && star_end.value < star_start.value) {
    star_end.value = star_start.value;
  }
};

const fetchGenres = async () => {
  const genreUrl = getBaseMovieUrl(apiKey.value, '/genre/movie/list');
  try {
    const response = await getResponse(genreUrl);
    genres.value = response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
};

const enableThumbMovement = () => {
  // 이 함수는 thumb 이동을 활성화하는 로직을 구현해야 합니다.
  // 현재 구현은 생략되어 있습니다.
};

onMounted(() => {
  fetchGenres();
  enableThumbMovement();
});

watch([selected_genre_ids, selectedLanguage, star_start, star_end], () => {
  // URL 업데이트 로직
});
</script>

<style scoped>
.popular-container {
  padding: 20px;
  color: white;
}

.container {
  width: 85%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    width: 90%;
  }
}

.search-container {
  margin-bottom: 20px;
}

.search-bar {
  position: relative;
  width: 100%;
}

.search-bar input {
  width: 100%;
  padding: 10px 15px;
  border-radius: 20px;
  border: none;
  background-color: white;
}

.search-bar i {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: red;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.filter-dropdown {
  background-color: black;
  padding: 15px;
  border-radius: 5px;
}

.filter-section {
  margin-bottom: 15px;
}

.filter-section h3 {
  margin-bottom: 10px;
  font-size: 14px;
}

.range-slider-container {
  width: 200px;
  margin: 0 auto;
  text-align: left;
}

.range-slider {
  position: relative;
  width: 100%;
  height: 20px;
  padding: 5px 0;
}

.range-slider-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  width: 100%;
  background: #ddd;
}

.range-slider-thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: #ff0000;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}

.range-slider input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 100%;
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  pointer-events: none;
}

.range-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
}

.range-slider input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
}

.range-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.range-mark {
  color: #888;
  font-size: 10px;
}

button {
  margin-right: 5px;
  margin-bottom: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #333;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  font-size: 14px;
}

button.active {
  background-color: red;
  color: black;
}

button:hover:not(:disabled) {
  background-color: #555;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-table-container {
  height: 70vh;
  overflow-y: auto;
  transition: margin-top 0.3s ease;
}

.page-table-container.pushed-down {
  margin-top: 20px;
}
</style>