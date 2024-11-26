<template>
  <div class="popular-container">
    <div class="container search-container">
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

    <div class="container filter-container">
      <div class="filter-buttons">
        <button @click="toggleFilter" class="filter-toggle" :class="{ active: showFilter }" :disabled="isSearchMode">필터</button>
        <button @click="resetFilterAndClose" class="filter-reset">초기화</button>
      </div>
      <!-- 기존 필터 드롭다운 내용 -->
      <div v-if="showFilter" class="filter-dropdown">
        <!-- 기존 필터 컨텐츠 유지 -->
      </div>
    </div>

    <div class="container page-table-container" :class="{ 'pushed-down': showFilter }">
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

  console.log('Generated URL:', url);

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
    
    // 검색 기록 저장
    saveSearchHistory(inputStr);

    const baseUrl = getBaseMovieUrl(apiKey.value, "/search/movie", '&language=ko-KR');
    const urlWithQuery = addExtraQuery2MovieUrl(baseUrl, `&query=${encodeURIComponent(inputStr)}`);
    const finalUrl = addPage2MovieUrl(urlWithQuery, 1);

    try {
      const movies = await getMovieDatas(finalUrl);
      searchedMovies.value = movies;
      // 검색 완료 후 입력창 비우기
      searchQuery.value = '';
    } catch (error) {
      console.error('Error searching movies:', error);
      searchedMovies.value = [];
      // 에러 발생시에도 입력창 비우기
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
  refreshTable();
};

const refreshTable = () => {
  tableKey.value += 1;
};

onMounted(() => {
  fetchGenres();
  setupEventListeners();
  loadSearchHistory();
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

@media (min-width: 769px) {
  .search-bar {
    width: 40%;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .container {
    width: 90%;
  }
  .filter-dropdown {
    width: 70% !important;
  }
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
  margin: 20px 0;
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
  margin-right: 2px;
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
  background-color: #333;
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
  transition: margin-top 0.3s ease;
}

.page-table-container.pushed-down {
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
  border: 1px solid #fff; /* 테두리 추가 */
  border-radius: 12px; /* 모서리 둥글게 */
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
</style>