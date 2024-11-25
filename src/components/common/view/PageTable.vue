<template>
  <div class="table-container">
    <div class="movie-grid" ref="gridContainer">
      <template v-for="movie in displayMovies" :key="movie.id">
        <component 
          :is="isMobile ? PosterMobile : Poster" 
          :movie="movie"
        />
      </template>
    </div>

    <div class="pagination-controls">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-button"
      >
        이전
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="page-button"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { getMovieDatas, processMovieAndMetaData } from '../api/api';
import { addPage2MovieUrl } from '../api/url';
import Poster from './Poster.vue';
import PosterMobile from './PosterMobile.vue';

const props = defineProps({
  baseURL: {
    type: String,
    required: true
  }
});

const movies = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalResults = ref(0);
const isMobile = ref(false);
const gridContainer = ref(null);
const itemsPerPage = ref(0);

const calculateItemsPerPage = () => {
  if (!gridContainer.value) return;
  
  const containerWidth = gridContainer.value.clientWidth;
  const containerHeight = gridContainer.value.clientHeight;
  const itemWidth = isMobile.value ? 150 : 200;
  const itemHeight = isMobile.value ? 250 : 350;
  
  const columns = Math.floor(containerWidth / itemWidth);
  const rows = Math.floor(containerHeight / itemHeight);
  
  return columns * rows;
};

const displayMovies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return movies.value.slice(start, start + itemsPerPage.value);
});

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
  itemsPerPage.value = calculateItemsPerPage();
};

const fetchMovies = async (page) => {
  const url = addPage2MovieUrl(props.baseURL, page);
  const result = await getMovieDatas(url);
  const processedData = processMovieAndMetaData(result);
  
  movies.value = [...movies.value, ...processedData.movies];
  totalPages.value = processedData.totalPages;
  totalResults.value = processedData.totalResults;
  
  // 여유분 데이터 미리 로드
  if (movies.value.length - (currentPage.value * itemsPerPage.value) < 100) {
    if (page < totalPages.value) {
      await fetchMovies(page + 1);
    }
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    
    // 다음 페이지 데이터가 부족한 경우 추가 로드
    const neededMovies = (currentPage.value + 1) * itemsPerPage.value;
    if (movies.value.length < neededMovies) {
      await fetchMovies(Math.ceil(movies.value.length / itemsPerPage.value) + 1);
    }
  }
};

watch(() => currentPage.value, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  fetchMovies(1);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  gap: 20px;
}

.page-button {
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-button:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.page-button:hover:not(:disabled) {
  background-color: #444;
}

.page-info {
  color: white;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .pagination-controls {
    padding: 10px 0;
    gap: 10px;
  }

  .page-button {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .page-info {
    font-size: 0.9rem;
  }
}
</style>
