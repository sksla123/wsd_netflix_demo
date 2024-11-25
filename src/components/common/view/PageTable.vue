<template>
  <div class="table-container" ref="tableContainer">
    <div class="white-container" :style="containerStyle">
      <div class="movie-grid" ref="gridContainer" :style="gridStyle">
        <template v-for="movie in displayMovies" :key="movie.id">
          <component 
            :is="isMobile ? PosterMobile : Poster" 
            :movie="movie"
          />
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

const POSTER_CONFIG = {
  desktop: {
    width: 200,
    height: 300,
    totalHeight: 350,
    gap: 20,
    padding: 20
  },
  mobile: {
    width: 150,
    height: 225,
    totalHeight: 245, // 더 축소된 전체 높이
    gap: 5,
    padding: 5
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

  const config = isMobile.value ? POSTER_CONFIG.mobile : POSTER_CONFIG.desktop;
  const containerPadding = isMobile.value ? 10 : 40;
  const paginationHeight = isMobile.value ? 50 : 100;
  
  const containerWidth = tableContainer.value.clientWidth - containerPadding;
  const containerHeight = tableContainer.value.clientHeight - paginationHeight;

  const usableWidth = containerWidth - (config.padding * 2);
  const usableHeight = containerHeight - (config.padding * 2);

  const maxColumns = Math.floor((usableWidth + config.gap) / (config.width + config.gap));
  const maxRows = Math.floor((usableHeight + config.gap) / (config.totalHeight + config.gap));

  return {
    columns: Math.max(1, maxColumns),
    rows: Math.max(1, maxRows)
  };
};

const gridStyle = computed(() => {
  const config = isMobile.value ? POSTER_CONFIG.mobile : POSTER_CONFIG.desktop;
  return {
    gridTemplateColumns: `repeat(${gridDimensions.value.columns}, ${config.width}px)`,
    gap: `${config.gap}px`,
    padding: `${config.padding}px`,
    justifyContent: 'center',
    width: '100%'
  };
});

const containerStyle = computed(() => {
  const config = isMobile.value ? POSTER_CONFIG.mobile : POSTER_CONFIG.desktop;
  const totalWidth = (gridDimensions.value.columns * config.width) + 
                    ((gridDimensions.value.columns - 1) * config.gap) + 
                    (config.padding * 2);
  const totalHeight = (gridDimensions.value.rows * config.totalHeight) + 
                     ((gridDimensions.value.rows - 1) * config.gap) + 
                     (config.padding * 2);
  
  return {
    width: '100%',
    height: `${totalHeight}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
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
  width: 100%;
}

.movie-grid {
  display: grid;
  justify-content: center;
  align-items: start;
  width: 100%;
  box-sizing: border-box;
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
    padding: 5px;
  }

  .white-container {
    margin-bottom: 5px;
  }

  .pagination-controls {
    padding: 8px;
    gap: 10px;
    margin-top: 5px;
  }

  .page-button {
    padding: 6px 12px;
    font-size: 0.9rem;
    min-width: 60px;
  }

  .page-info {
    font-size: 0.9rem;
    min-width: 80px;
  }
}
</style>