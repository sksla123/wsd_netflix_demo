<template>
  <div class="popular-container">
    <div class="container search-container animate-section">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="영화 검색..." @keyup.enter="performSearch" />
        <i class="pi pi-search" @click="performSearch"></i>
      </div>
      <!-- 검색 기록 영역을 search-bar 밖으로 이동 -->
      <div v-if="userSearchHistory.length > 0" class="search-history-container">
        <div class="search-history-wrapper">
          <div v-for="(record, index) in userSearchHistory" 
               :key="index" 
               class="search-record">
            <span class="record-text" @click="applySearchRecord(record)">{{ record }}</span>
            <i class="pi pi-times delete-record" @click.stop="deleteSearchRecord(index)"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="container filter-container animate-section">
      <div class="filter-buttons">
        <button @click="toggleFilter" class="filter-toggle" :class="{ active: showFilter }" :disabled="isSearchMode">필터</button>
        <button @click="resetFilterAndClose" class="filter-reset">초기화</button>
      </div>
      <div v-if="showFilter" class="filter-dropdown">
        <!-- 평점 필터 -->
        <div class="filter-section">
          <h3>평점: {{ star_start }} - {{ star_end }}</h3>
          <div class="range-slider-container">
            <div class="range-slider">
              <div class="range-slider-track"></div>
              <div class="range-slider-fill" :style="{ left: `${star_start * 10}%`, width: `${(star_end - star_start) * 10}%` }"></div>
              <div class="range-slider-thumb start" :style="{ left: `${star_start * 10}%` }" @mousedown="startDrag('start')" @touchstart="startDrag('start')"></div>
              <div class="range-slider-thumb end" :style="{ left: `${star_end * 10}%` }" @mousedown="startDrag('end')" @touchstart="startDrag('end')"></div>
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

        <!-- 적용 버튼 -->
        <div class="apply-button-container">
          <button @click="applyFilter" class="apply-button">적용</button>
        </div>
      </div>
    </div>

    <div class="container page-table-container" :class="{ 'filter-open': showFilter }">
      <div v-if="isSearchMode && searchedMovies.length === 0" class="no-results">
        검색 결과가 없습니다.
      </div>
      <PageTable v-else-if="!isSearchMode" :key="tableKey" :baseURL="movieUrl" />
      <PageTable2 v-else :movies="searchedMovies" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { getBaseMovieUrl, addExtraQuery2MovieUrl, addPage2MovieUrl } from './common/api/url';
import { getResponse, getMovieDatas } from './common/api/api';
import PageTable from './common/view/PageTable.vue';
import PageTable2 from './common/view/PageTable2.vue';

const store = useStore();
const searchQuery = ref('');
const userSearchHistory = ref([]);
const selected_genre_ids = ref([]);
const selectedLanguage = ref('ko');
const genres = ref([]);
const showFilter = ref(false);
const tableKey = ref(0);
const isSearchMode = ref(false);
const searchedMovies = ref([]);

const star_start = ref(0);
const star_end = ref(10);

const userEmail = computed(() => store.state.userEmail);
const apiKey = computed(() => store.state.userAPIKey);

const movieUrl = computed(() => {
  const language = selectedLanguage.value === 'ko' ? '&language=ko-KR' : '&language=en-US';
  let url = getBaseMovieUrl(apiKey.value, '/discover/movie', language);
  
  if (selected_genre_ids.value.length > 0) {
    url = addExtraQuery2MovieUrl(url, `&with_genres=${selected_genre_ids.value.join(',')}`);
  }

  url = addExtraQuery2MovieUrl(url, `&vote_average.gte=${star_start.value}&vote_average.lte=${star_end.value}`);

  return url;
});

// 검색 기록 관리 함수들
const loadSearchHistory = () => {
  const allSearchHistory = JSON.parse(localStorage.getItem('userSearchingRecord') || '{}');
  userSearchHistory.value = allSearchHistory[userEmail.value] || [];
};

const saveSearchHistory = (query) => {
  const allSearchHistory = JSON.parse(localStorage.getItem('userSearchingRecord') || '{}');
  let userHistory = allSearchHistory[userEmail.value] || [];
  
  // 중복 제거
  userHistory = userHistory.filter(item => item !== query);
  
  // 새 검색어 추가
  userHistory.unshift(query);
  
  // 최대 5개까지만 유지
  if (userHistory.length > 5) {
    userHistory = userHistory.slice(0, 5);
  }
  
  allSearchHistory[userEmail.value] = userHistory;
  localStorage.setItem('userSearchingRecord', JSON.stringify(allSearchHistory));
  
  // 현재 표시되는 검색 기록 업데이트
  userSearchHistory.value = userHistory;
};

const deleteSearchRecord = (index) => {
  const allSearchHistory = JSON.parse(localStorage.getItem('userSearchingRecord') || '{}');
  let userHistory = allSearchHistory[userEmail.value] || [];
  
  userHistory.splice(index, 1);
  allSearchHistory[userEmail.value] = userHistory;
  
  localStorage.setItem('userSearchingRecord', JSON.stringify(allSearchHistory));
  userSearchHistory.value = userHistory;
};

const applySearchRecord = (query) => {
  searchQuery.value = query;
  performSearch();
};

const performSearch = async () => {
  const inputStr = searchQuery.value.trim();
  if (inputStr) {
    isSearchMode.value = true;
    showFilter.value = false;
    
    saveSearchHistory(inputStr);

    const baseUrl = getBaseMovieUrl(apiKey.value, "/search/movie", '&language=ko-KR');
    const urlWithQuery = addExtraQuery2MovieUrl(baseUrl, `&query=${encodeURIComponent(inputStr)}`);
    const finalUrl = addPage2MovieUrl(urlWithQuery, 1);

    try {
      const movies = await getMovieDatas(finalUrl);
      searchedMovies.value = movies;
      searchQuery.value = '';
      tableKey.value += 1; // 검색 결과 테이블 리렌더링
    } catch (error) {
      console.error('Error searching movies:', error);
      searchedMovies.value = [];
      searchQuery.value = '';
    }
  }
};

const toggleFilter = () => {
  if (!isSearchMode.value) {
    showFilter.value = !showFilter.value;
    if (showFilter.value) {
      resetFilter();
    }
  }
};

const resetFilter = () => {
  star_start.value = 0;
  star_end.value = 10;
  selected_genre_ids.value = [];
  selectedLanguage.value = 'ko';
};

const resetFilterAndClose = () => {
  resetFilter();
  showFilter.value = false;
  isSearchMode.value = false;
  searchQuery.value = '';
  searchedMovies.value = [];
  refreshTable();
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

const fetchGenres = async () => {
  const genreUrl = getBaseMovieUrl(apiKey.value, '/genre/movie/list');
  try {
    const response = await getResponse(genreUrl);
    genres.value = response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
};

let isDragging = false;
let currentThumb = null;

const startDrag = (thumb) => {
  isDragging = true;
  currentThumb = thumb;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', drag);
  document.addEventListener('touchend', stopDrag);
};

const drag = (e) => {
  if (!isDragging) return;
  
  const rangeSlider = document.querySelector('.range-slider');
  const rect = rangeSlider.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  let percentage = Math.min(Math.max(x / rect.width, 0), 1);
  let newValue = Math.round(percentage * 10);
  
  if (currentThumb === 'start') {
    if (newValue < star_end.value) {
      star_start.value = newValue;
    } else {
      star_start.value = star_end.value - 1;
    }
  } else {
    if (newValue > star_start.value) {
      star_end.value = newValue;
    } else {
      star_end.value = star_start.value + 1;
    }
  }
};

const stopDrag = () => {
  isDragging = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', drag);
  document.removeEventListener('touchend', stopDrag);
};

const setupEventListeners = () => {
  const buttons = document.querySelectorAll('button');
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  buttons.forEach(button => {
    if (isMobile) {
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.click();
      }, { passive: false });
    }
  });
};

const applyFilter = () => {
  showFilter.value = false; // 필터 드롭다운 닫기
  refreshTable();
};


const refreshTable = () => {
  // 테이블 강제 리렌더링을 위한 키 변경
  tableKey.value += 1;
  
  // 검색 모드가 아닐 때만 PageTable 표시
  if (!isSearchMode.value) {
    searchedMovies.value = [];
  }
};

const animateSections = () => {
  const sections = document.querySelectorAll('.animate-section');
  sections.forEach((section, index) => {
    setTimeout(() => {
      section.classList.add('animate');
    }, index * 200);
  });
};

onMounted(() => {
  fetchGenres();
  setupEventListeners();
  loadSearchHistory();
  animateSections();
});

// 로그인 상태 변경 감지
watch(() => store.state.userEmail, () => {
  loadSearchHistory();
});

watch([selected_genre_ids, selectedLanguage, star_start, star_end], () => {
  // URL 업데이트 로직은 이제 movieUrl computed 속성에서 자동으로 처리됩니다.
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

.search-container {
  margin-bottom: 20px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border-radius: 20px;
  border: none;
  background-color: white;
  box-sizing: border-box;
}

.search-bar i {
  position: absolute;
  top: 24%;
  right: 14px;
  color: red;
  cursor: pointer;
  z-index: 2;
  font-size: 16px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  gap: 2px;
}

.filter-dropdown {
  background-color: black;
  padding: 15px;
  border-radius: 5px;
  width: 50%;
  max-width: 70%;
}

.filter-section {
  margin-bottom: 15px;
}

.filter-section h3 {
  margin-bottom: 10px;
  font-size: 14px;
}

.range-slider-container {
  width: 80%;
  max-width: 300px;
  margin: 10px 10px;
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

.range-slider-fill {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  background: #ff0000;
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
  margin-right: 8px;
  margin-bottom: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #333;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}

button:hover {
  background-color: #444;
}

button.active {
  background-color: black;
  color: white;
}

.filter-dropdown button.active {
  background-color: red;
  color: black;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-reset {
  background-color: red;
  color: black;
}


.apply-button-container {
  display: flex;
  justify-content: flex-end;
}

.apply-button {
  background-color: white;
  color: black;
  border-radius: 5px;
  font-weight: bold;
  margin-bottom: 0px;
}

.page-table-container {
  height: 70vh;
  overflow-y: auto;
  transition: none
}

/* 필터가 열릴 때는 마진만 조정 */
.filter-open {
  margin-top: 20px;
}

.no-results {
  text-align: center;
  font-size: 18px;
  margin-top: 20px;
}

.search-history-container {
  margin-top: 20px;
  width: 100%;
}

.search-history-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.search-record {
  display: inline-flex;
  align-items: center;
  background: transparent;
  padding: 4px 8px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #fff;
  border-radius: 12px;
}

.record-text {
  margin-right: 4px;
}

.delete-record {
  font-size: 10px;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.animate-section {
  opacity: 0;
  transition: opacity 0.5s ease; /* transform 제거하고 opacity만 적용 */
}

.animate-section.animate {
  opacity: 1; /* transform 제거하고 opacity만 적용 */
}

@media (min-width: 769px) {
  .search-bar {
    width: 40%;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .container {
    width: 100%;
  }
  .search-container {
    width: 80%;
  }
  .filter-dropdown {
    width: 70% !important;
  }
}
</style>