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
    posterWidth: 220,
    posterHeight: 340,
    gap: 10,
    padding: 20,
    innerPadding: 10
  },
  mobile: {
    posterWidth: 165,
    posterHeight: 255,
    gap: 5,
    padding: 10,
    innerPadding: 8
  }
};

const props = defineProps({
  baseURL: { type: String, required: true }
});

const movies = ref([]);
const currentPage = ref(1);
const totalResults = ref(0);
const isMobile = ref(false);
const tableContainer = ref(null);
const gridDimensions = ref({ columns: 0, rows: 0 });
let resizeObserver = null;

const config = computed(() => isMobile.value ? CONFIG.mobile : CONFIG.desktop);

const posterContainerStyle = computed(() => ({
  width: `${config.value.posterWidth}px`,
  height: `${config.value.posterHeight}px`,
  padding: `${config.value.innerPadding}px`
}));

const whiteContainerStyle = computed(() => {
  const { posterWidth, posterHeight, gap, padding } = config.value;
  const { columns, rows } = gridDimensions.value;
  
  const contentWidth = (columns * posterWidth) + ((columns - 1) * gap);
  const contentHeight = (rows * posterHeight) + ((rows - 1) * gap);
  
  const totalWidth = contentWidth + (padding * 2);
  const totalHeight = contentHeight + (padding * 2);
  
  return {
    width: `${totalWidth}px`,
    height: `${totalHeight}px`,
    padding: `${padding}px`,
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

const displayedPageNumbers = computed(() => {
  const total = calculatedTotalPages.value;
  const current = currentPage.value;
  let pages = [];

  pages.push(1);

  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);

  if (start > 2) {
    pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 1) {
    pages.push('...');
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
});

const calculateGridDimensions = () => {
  if (!tableContainer.value) return { columns: 1, rows: 1 };

  const { posterWidth, posterHeight, gap, padding } = config.value;
  const containerPadding = isMobile.value ? 20 : 40;
  const paginationHeight = isMobile.value ? 60 : 100;
  
  const availableWidth = tableContainer.value.clientWidth - containerPadding - (padding * 2);
  const availableHeight = tableContainer.value.clientHeight - paginationHeight - (padding * 2);

  const columns = Math.floor((availableWidth + gap) / (posterWidth + gap));
  const rows = Math.floor((availableHeight + gap) / (posterHeight + gap));

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

const goToPage = async (page) => {
  if (page === '...' || page === currentPage.value) return;
  
  currentPage.value = page;
  const neededMovies = (currentPage.value + 1) * itemsPerPage.value;
  if (movies.value.length < neededMovies) {
    await fetchMovies(Math.ceil(movies.value.length / itemsPerPage.value) + 1);
  }
};

const goToFirstPage = () => goToPage(1);
const goToLastPage = () => goToPage(calculatedTotalPages.value);
const prevPage = () => currentPage.value > 1 && goToPage(currentPage.value - 1);
const nextPage = () => currentPage.value < calculatedTotalPages.value && goToPage(currentPage.value + 1);

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
  margin-bottom: 4px;
  justify-content: center;
  align-items: center;
  gap: inherit;
}

.poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 8px;
  background: transparent;
}

.poster-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-item {
  width: 100%;
  height: 100%;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 10px;
  margin-top: 10px;
}

.page-numbers {
  display: flex;
  gap: 5px;
  align-items: center;
}

.page-info {
  color: white;
  font-size: 1rem;
  min-width: 80px;
  text-align: center;
}

.page-button {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.page-button,
.page-number {
  padding: 6px 12px;
  background: none;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
  font-size: 0.9rem;
}

.page-button:hover:not(:disabled),
.page-number:hover:not(:disabled):not(.active):not(.ellipsis) {
  background-color: rgba(255, 255, 255, 0.1);
}

.page-button:disabled,
.page-number:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.page-number.ellipsis {
  border: none;
  padding: 6px 8px;
  cursor: default;
}

@media (max-width: 768px) {
  .table-container {
    padding: 10px;
  }

  .white-container {
    margin-bottom: 4px;
  }

  .pagination-controls {
    padding: 5px;
    gap: 5px;
    margin-top: 5px;
  }

  .page-button,
  .page-number {
    padding: 4px 8px;
    min-width: 30px;
    font-size: 0.8rem;
  }

  .page-button:first-child,
  .page-button:last-child {
    display: none;
  }

  .pagination-controls {
    display: flex;  /* 반드시 표시되도록 설정 */
    padding: 5px;
    gap: 8px;
  }

  .page-button {
    display: block;  /* 버튼이 항상 표시되도록 설정 */
    padding: 4px 8px;
    min-width: 50px;
    font-size: 0.9rem;
  }
}
</style>