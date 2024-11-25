<template>
  <div class="table-container" ref="tableContainer">
    <div class="white-container">
      <div class="movie-grid" ref="gridContainer" :style="gridStyle">
        <template v-for="movie in displayMovies" :key="movie.id">
          <div class="poster-container">
            <div class="poster-wrapper">
              <component 
                :is="isMobile ? PosterMobile : Poster" 
                :movie="movie"
                class="poster-item"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="pagination-controls">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-button"
      >
        이전
      </button>
      <span class="page-info">{{ currentPage }} / {{ calculatedTotalPages }}</span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === calculatedTotalPages"
        class="page-button"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { getMovieDatas, getMovieAndMetaDatas } from '../api/api';
import { addPage2MovieUrl } from '../api/url';
import Poster from './Poster.vue';
import PosterMobile from './PosterMobile.vue';

const CONTAINER_CONFIG = {
  desktop: {
    width: 220,  // 포스터 너비 + 패딩
    height: 370, // 포스터 높이 + 패딩 + 타이틀 영역
    gap: 20,
    padding: 20,
    innerPadding: 10  // 포스터와 컨테이너 사이 간격
  },
  mobile: {
    width: 165,  // 포스터 너비 + 패딩
    height: 265, // 포스터 높이 + 패딩 + 타이틀 영역
    gap: 5,
    padding: 2,
    innerPadding: 8   // 포스터와 컨테이너 사이 간격
  }
};

const props = defineProps({
  baseURL: {
    type: String,
    required: true
  }
});

const movies = ref([]);
const currentPage = ref(1);
const totalResults = ref(0);
const isMobile = ref(false);
const tableContainer = ref(null);
const gridContainer = ref(null);
const gridDimensions = ref({ columns: 0, rows: 0 });
let resizeObserver = null;

const calculateGridDimensions = () => {
  if (!tableContainer.value) return { columns: 1, rows: 1 };

  const config = isMobile.value ? CONTAINER_CONFIG.mobile : CONTAINER_CONFIG.desktop;
  const containerPadding = isMobile.value ? 4 : 40;
  const paginationHeight = isMobile.value ? 40 : 100;
  
  const containerWidth = tableContainer.value.clientWidth - containerPadding;
  const containerHeight = tableContainer.value.clientHeight - paginationHeight;

  const usableWidth = containerWidth - (config.padding * 2);
  const usableHeight = containerHeight - (config.padding * 2);

  const maxColumns = Math.floor((usableWidth + config.gap) / (config.width + config.gap));
  const maxRows = Math.floor((usableHeight + config.gap) / (config.height + config.gap));

  return {
    columns: Math.max(1, maxColumns),
    rows: Math.max(1, maxRows)
  };
};

const gridStyle = computed(() => {
  const config = isMobile.value ? CONTAINER_CONFIG.mobile : CONTAINER_CONFIG.desktop;
  const totalWidth = (gridDimensions.value.columns * config.width) + 
                    ((gridDimensions.value.columns - 1) * config.gap);
  
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridDimensions.value.columns}, ${config.width}px)`,
    gap: `${config.gap}px`,
    padding: `${config.padding}px`,
    width: `${totalWidth}px`,
    margin: '0 auto'
  };
});

const calculatedTotalPages = computed(() => {
  const itemsPerPage = gridDimensions.value.columns * gridDimensions.value.rows;
  if (itemsPerPage <= 0 || totalResults.value <= 0) return 1;
  return Math.ceil(totalResults.value / itemsPerPage);
});

const displayMovies = computed(() => {
  const itemsPerPage = gridDimensions.value.columns * gridDimensions.value.rows;
  const start = (currentPage.value - 1) * itemsPerPage;
  return movies.value.slice(start, start + itemsPerPage);
});

const updateGridLayout = async () => {
  const newDimensions = calculateGridDimensions();
  const previousItemsPerPage = gridDimensions.value.columns * gridDimensions.value.rows;
  const newItemsPerPage = newDimensions.columns * newDimensions.rows;

  if (previousItemsPerPage !== newItemsPerPage) {
    gridDimensions.value = newDimensions;
    
    await nextTick();
    
    if (previousItemsPerPage > 0) {
      const currentFirstItem = (currentPage.value - 1) * previousItemsPerPage;
      currentPage.value = Math.floor(currentFirstItem / newItemsPerPage) + 1;
    }
    
    if (currentPage.value > calculatedTotalPages.value) {
      currentPage.value = Math.max(1, calculatedTotalPages.value);
    }
  }
};

const checkScreenSize = async () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 768;
  
  if (wasMobile !== isMobile.value) {
    await nextTick();
    updateGridLayout();
  }
};

const fetchMovies = async (page) => {
  try {
    const url = addPage2MovieUrl(props.baseURL, page);
    const processedData = await getMovieAndMetaDatas(url);
    
    movies.value = [...movies.value, ...processedData.movies];
    totalResults.value = processedData.totalResults;
    
    const itemsPerPage = gridDimensions.value.columns * gridDimensions.value.rows;
    const remainingItems = movies.value.length - (currentPage.value * itemsPerPage);
    if (remainingItems < 100 && movies.value.length < totalResults.value) {
      await fetchMovies(page + 1);
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = async () => {
  if (currentPage.value < calculatedTotalPages.value) {
    currentPage.value++;
    
    const itemsPerPage = gridDimensions.value.columns * gridDimensions.value.rows;
    const neededMovies = (currentPage.value + 1) * itemsPerPage;
    if (movies.value.length < neededMovies) {
      await fetchMovies(Math.ceil(movies.value.length / itemsPerPage) + 1);
    }
  }
};

const initializeLayout = async () => {
  await nextTick();
  checkScreenSize();
  updateGridLayout();
};

watch([() => gridDimensions.value, () => calculatedTotalPages.value], () => {
  if (currentPage.value > calculatedTotalPages.value) {
    currentPage.value = Math.max(1, calculatedTotalPages.value);
  }
});

onMounted(async () => {
  await initializeLayout();
  
  window.addEventListener('resize', () => {
    requestAnimationFrame(checkScreenSize);
  });
  
  resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updateGridLayout);
  });
  
  if (tableContainer.value) {
    resizeObserver.observe(tableContainer.value);
  }
  
  fetchMovies(1);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
}

.white-container {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
}

.movie-grid {
  display: grid;
  align-items: start;
}

.poster-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
}

.poster-wrapper {
  width: calc(100% - var(--inner-padding) * 2);
  height: calc(100% - var(--inner-padding) * 2);
  margin: var(--inner-padding);
}

.poster-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  gap: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  margin-top: auto;
}

.page-button {
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  min-width: 80px;
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
  min-width: 100px;
  text-align: center;
}

@media (max-width: 768px) {
  .table-container {
    padding: 4px;
  }

  .white-container {
    margin-bottom: 4px;
  }

  .pagination-controls {
    padding: 8px;
    gap: 8px;
    margin-top: 4px;
  }

  .page-button {
    padding: 4px 8px;
    font-size: 0.9rem;
    min-width: 50px;
  }

  .page-info {
    font-size: 0.9rem;
    min-width: 70px;
  }

  .poster-container {
    --inner-padding: 8px;
  }
}

:root {
  --inner-padding: 10px;
}
</style>