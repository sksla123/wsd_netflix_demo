<template>
  <div class="table-container" ref="tableContainer">
    <div class="white-container" :style="whiteContainerStyle">
      <div class="poster-container" 
           v-for="movie in displayMovies" 
           :key="movie.id" 
           :style="posterContainerStyle">
        <div class="poster-wrapper">
          <component 
            :is="isMobile ? PosterMobile : Poster" 
            :movie="movie"
            class="poster-item"
          />
        </div>
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
import { getMovieAndMetaDatas } from '../api/api';
import { addPage2MovieUrl } from '../api/url';
import Poster from './Poster.vue';
import PosterMobile from './PosterMobile.vue';

const CONFIG = {
  desktop: {
    posterWidth: 200,
    posterHeight: 300,
    titleHeight: 50,
    gap: 20,
    padding: 20,
    innerPadding: 10
  },
  mobile: {
    posterWidth: 150,
    posterHeight: 225,
    titleHeight: 40,
    gap: 5,
    padding: 2,
    innerPadding: 8
  }
};

const props = defineProps({
  baseURL: { type: String, required: true }
});

// State
const movies = ref([]);
const currentPage = ref(1);
const totalResults = ref(0);
const isMobile = ref(false);
const tableContainer = ref(null);
const gridDimensions = ref({ columns: 0, rows: 0 });
let resizeObserver = null;

// Computed
const config = computed(() => isMobile.value ? CONFIG.mobile : CONFIG.desktop);

const posterContainerStyle = computed(() => {
  const { posterWidth, posterHeight, titleHeight } = config.value;
  return {
    width: `${posterWidth}px`,
    height: `${posterHeight + titleHeight}px`
  };
});

const whiteContainerStyle = computed(() => {
  const { posterWidth, posterHeight, titleHeight, gap } = config.value;
  const { columns, rows } = gridDimensions.value;
  
  const totalWidth = (columns * (posterWidth + gap)) - gap;
  const totalHeight = (rows * (posterHeight + titleHeight + gap)) - gap;
  
  return {
    width: `${totalWidth}px`,
    height: `${totalHeight}px`,
    gap: `${gap}px`
  };
});

const itemsPerPage = computed(() => 
  gridDimensions.value.columns * gridDimensions.value.rows
);

const calculatedTotalPages = computed(() => 
  Math.ceil(totalResults.value / itemsPerPage.value) || 1
);

const displayMovies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return movies.value.slice(start, start + itemsPerPage.value);
});

// Methods
const calculateGridDimensions = () => {
  if (!tableContainer.value) return { columns: 1, rows: 1 };

  const { posterWidth, posterHeight, titleHeight, gap } = config.value;
  const containerPadding = isMobile.value ? 4 : 40;
  const paginationHeight = isMobile.value ? 40 : 100;
  
  const availableWidth = tableContainer.value.clientWidth - containerPadding;
  const availableHeight = tableContainer.value.clientHeight - paginationHeight;

  const columns = Math.floor(availableWidth / (posterWidth + gap));
  const rows = Math.floor(availableHeight / (posterHeight + titleHeight + gap));

  return {
    columns: Math.max(1, columns),
    rows: Math.max(1, rows)
  };
};

const updateGridLayout = async () => {
  const newDimensions = calculateGridDimensions();
  if (JSON.stringify(newDimensions) !== JSON.stringify(gridDimensions.value)) {
    const currentFirstItem = (currentPage.value - 1) * itemsPerPage.value;
    gridDimensions.value = newDimensions;
    await nextTick();
    currentPage.value = Math.floor(currentFirstItem / itemsPerPage.value) + 1;
    currentPage.value = Math.min(currentPage.value, calculatedTotalPages.value);
  }
};

const fetchMovies = async (page) => {
  try {
    const url = addPage2MovieUrl(props.baseURL, page);
    const { movies: newMovies, totalResults: total } = await getMovieAndMetaDatas(url);
    movies.value = [...movies.value, ...newMovies];
    totalResults.value = total;
    
    if (movies.value.length - (currentPage.value * itemsPerPage.value) < 100 
        && movies.value.length < totalResults.value) {
      await fetchMovies(page + 1);
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
};

const navigation = {
  prev: () => currentPage.value > 1 && currentPage.value--,
  next: async () => {
    if (currentPage.value < calculatedTotalPages.value) {
      currentPage.value++;
      const neededMovies = (currentPage.value + 1) * itemsPerPage.value;
      if (movies.value.length < neededMovies) {
        await fetchMovies(Math.ceil(movies.value.length / itemsPerPage.value) + 1);
      }
    }
  }
};

// Lifecycle & Watchers
onMounted(async () => {
  isMobile.value = window.innerWidth < 768;
  await nextTick();
  updateGridLayout();
  
  window.addEventListener('resize', () => 
    requestAnimationFrame(() => {
      isMobile.value = window.innerWidth < 768;
      updateGridLayout();
    })
  );
  
  resizeObserver = new ResizeObserver(() => 
    requestAnimationFrame(updateGridLayout)
  );
  
  if (tableContainer.value) {
    resizeObserver.observe(tableContainer.value);
  }
  
  fetchMovies(1);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateGridLayout);
  resizeObserver?.disconnect();
});

// Exports
const { prev: prevPage, next: nextPage } = navigation;
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
  margin: 0 auto 10px auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.poster-container {
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