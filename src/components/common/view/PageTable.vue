<template>
  <div class="table-container" ref="tableContainer">
    <div class="white-container" :style="whiteContainerStyle">
      <div class="poster-container" v-for="movie in displayMovies" :key="movie.id" :style="posterContainerStyle">
        <div class="poster-wrapper">
          <component :is="isMobile ? PosterMobile : Poster" :movie="movie" class="poster-item" />
        </div>
      </div>
    </div>

    <div class="pagination-controls">
      <button @click="goToFirstPage" :disabled="currentPage === 1" class="page-button">
        «
      </button>
      <button @click="prevPage" :disabled="currentPage === 1" class="page-button">
        이전
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="pageNum in displayedPages" 
          :key="pageNum"
          @click="goToPage(pageNum)"
          :class="['page-number', { active: currentPage === pageNum, ellipsis: pageNum === '...' }]"
          :disabled="pageNum === '...'"
        >
          {{ pageNum }}
        </button>
      </div>

      <button @click="nextPage" :disabled="currentPage === calculatedTotalPages" class="page-button">
        다음
      </button>
      <button @click="goToLastPage" :disabled="currentPage === calculatedTotalPages" class="page-button">
        »
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
    gap: 20,
    padding: 40,  // 증가
    innerPadding: 10
  },
  mobile: {
    posterWidth: 165,
    posterHeight: 255,
    gap: 10,
    padding: 20,  // 증가
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

  // 컨테이너를 내부 콘텐츠보다 크게 설정
  const totalWidth = contentWidth + (padding * 2);
  const totalHeight = contentHeight + (padding * 2);

  return {
    width: `${totalWidth}px`,
    height: `${totalHeight}px`,
    padding: `${padding}px`,
    gap: `${gap}px`
  };
});

// [이하 코드는 이전과 동일]
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

// 페이지네이션 관련 computed 추가
const displayedPages = computed(() => {
  const total = calculatedTotalPages.value;
  const current = currentPage.value;
  let pages = [];

  // 항상 첫 페이지 표시
  pages.push(1);

  // 현재 페이지 주변 페이지 계산
  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);

  // 첫 페이지와 시작 페이지 사이에 간격이 있는 경우
  if (start > 2) {
    pages.push('...');
  }

  // 중간 페이지들 추가
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // 마지막 페이지와 끝 페이지 사이에 간격이 있는 경우
  if (end < total - 1) {
    pages.push('...');
  }

  // 항상 마지막 페이지 표시 (첫 페이지가 아닌 경우)
  if (total > 1) {
    pages.push(total);
  }

  return pages;
});

// 페이지 이동 함수들
const goToPage = (page) => {
  if (typeof page === 'number' && page !== currentPage.value) {
    currentPage.value = page;
  }
};

const goToFirstPage = () => {
  currentPage.value = 1;
};

const goToLastPage = () => {
  currentPage.value = calculatedTotalPages.value;
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
  margin-bottom: 4px;
  justify-content: center;
  align-items: center;
}

.poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 8px;
  background: transparent;
  /* 투명하게 변경 */
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
    padding: 10px;
  }

  .white-container {
    margin-bottom: 4px;
    justify-content: center;
    align-items: center;
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
}
</style>
