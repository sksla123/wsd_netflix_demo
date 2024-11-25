<template>
  <div class="table-container" ref="tableContainer">
    <div class="white-container" :style="containerStyle">
      <div v-for="movie in displayMovies" 
           :key="movie.id" 
           class="poster-container"
           :style="posterStyle">
        <PosterMobile 
          :movie="movie"
          class="poster-item"
        />
      </div>
    </div>

    <nav class="pagination">
      <button 
        @click="changePage(-1)" 
        :disabled="isFirstPage"
        class="page-button"
      >이전</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        @click="changePage(1)" 
        :disabled="isLastPage"
        class="page-button"
      >다음</button>
    </nav>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getMovieAndMetaDatas } from '../api/api';
import { addPage2MovieUrl } from '../api/url';
import PosterMobile from './PosterMobile.vue';

const LAYOUT = {
  poster: { width: 150, height: 225 },
  spacing: { gap: 10, padding: 20, inner: 8 }
};

const props = defineProps({
  baseURL: { type: String, required: true }
});

// State
const movies = ref([]);
const currentPage = ref(1);
const totalResults = ref(0);
const tableContainer = ref(null);
const grid = ref({ columns: 0, rows: 0 });

// Computed
const itemsPerPage = computed(() => grid.value.columns * grid.value.rows);
const totalPages = computed(() => Math.ceil(totalResults.value / itemsPerPage.value) || 1);
const isFirstPage = computed(() => currentPage.value === 1);
const isLastPage = computed(() => currentPage.value === totalPages.value);

const displayMovies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return movies.value.slice(start, start + itemsPerPage.value);
});

const posterStyle = computed(() => ({
  width: `${LAYOUT.poster.width}px`,
  height: `${LAYOUT.poster.height}px`,
  padding: `${LAYOUT.spacing.inner}px`
}));

const containerStyle = computed(() => {
  const { width, height } = LAYOUT.poster;
  const { gap, padding } = LAYOUT.spacing;
  const { columns, rows } = grid.value;
  
  const contentWidth = (columns * width) + ((columns - 1) * gap);
  const contentHeight = (rows * height) + ((rows - 1) * gap);
  
  return {
    width: `${contentWidth + padding * 2}px`,
    height: `${contentHeight + padding * 2}px`,
    padding: `${padding}px`,
    gap: `${gap}px`
  };
});

// Methods
const updateLayout = () => {
  if (!tableContainer.value) return;

  const { width, height } = LAYOUT.poster;
  const { gap, padding } = LAYOUT.spacing;
  const containerPadding = 40;
  const paginationHeight = 80;

  const availableWidth = tableContainer.value.clientWidth - containerPadding - (padding * 2);
  const availableHeight = tableContainer.value.clientHeight - paginationHeight - (padding * 2);

  grid.value = {
    columns: Math.max(1, Math.floor((availableWidth + gap) / (width + gap))),
    rows: Math.max(1, Math.floor((availableHeight + gap) / (height + gap)))
  };
};

const changePage = async (delta) => {
  const newPage = currentPage.value + delta;
  if (newPage < 1 || newPage > totalPages.value) return;
  
  currentPage.value = newPage;
  const neededMovies = (newPage + 1) * itemsPerPage.value;
  
  if (movies.value.length < neededMovies) {
    await loadMoreMovies(Math.ceil(movies.value.length / itemsPerPage.value) + 1);
  }
};

const loadMoreMovies = async (page) => {
  try {
    const url = addPage2MovieUrl(props.baseURL, page);
    const { movies: newMovies, totalResults: total } = await getMovieAndMetaDatas(url);
    
    movies.value = [...movies.value, ...newMovies];
    totalResults.value = total;
    
    if (movies.value.length < totalResults.value && 
        movies.value.length - (currentPage.value * itemsPerPage.value) < 100) {
      await loadMoreMovies(page + 1);
    }
  } catch (error) {
    console.error('Failed to load movies:', error);
  }
};

// Lifecycle
onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updateLayout);
  });
  
  resizeObserver.observe(tableContainer.value);
  loadMoreMovies(1);
  
  onUnmounted(() => resizeObserver.disconnect());
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
  margin: 0 auto 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: inherit;
}

.poster-container {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 8px;
}

.poster-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  padding: 10px;
}

.page-button {
  min-width: 60px;
  padding: 6px 12px;
  font-size: 0.9rem;
  color: white;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s ease;
}

.page-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  min-width: 80px;
  color: white;
  font-size: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .table-container {
    padding: 10px;
  }

  .pagination {
    gap: 8px;
    margin-top: 5px;
    padding: 5px;
  }

  .page-button {
    min-width: 50px;
    padding: 4px 8px;
    font-size: 0.9rem;
  }

  .page-info {
    min-width: 60px;
    font-size: 0.9rem;
  }
}
</style>