<template>
  <div class="grid-page">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <div class="grid-container">
        <component
          :is="isMobile ? 'PosterMobile' : 'Poster'"
          v-for="movie in displayedMovies"
          :key="movie.id"
          :movie="movie"
        />
      </div>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { getMovieDatas, processMovieAndMetaData } from '../api/api';
import Poster from './Poster.vue';
import PosterMobile from './PosterMobile.vue';

const props = defineProps({
  getUrl: {
    type: Function,
    required: true
  }
});

const store = useStore();
const currentPage = ref(1);
const movies = ref([]);
const totalPages = ref(0);
const totalResults = ref(0);
const displayedMovies = ref([]);
const loading = ref(true);
const error = ref(null);
const isMobile = ref(false);

const fetchMovies = async () => {
  loading.value = true;
  error.value = null;
  try {
    const url = props.getUrl(currentPage.value);
    const response = await getMovieDatas(url);
    const data = processMovieAndMetaData(response);

    movies.value = data.movies || [];
    totalPages.value = data.totalPages || 0;
    totalResults.value = data.totalResults || 0;
    updateDisplayedMovies();
  } catch (err) {
    console.error("Error fetching movies:", err);
    error.value = "Failed to load movies. Please try again later.";
  } finally {
    loading.value = false;
  }
};

const updateDisplayedMovies = () => {
  if (!Array.isArray(movies.value)) {
    displayedMovies.value = [];
    return;
  }
  const startIndex = (currentPage.value - 1) * 20;
  const endIndex = startIndex + 20;
  displayedMovies.value = movies.value.slice(startIndex, endIndex);

  if (displayedMovies.value.length < 20 && movies.value.length < totalResults.value) {
    fetchNextPage();
  }
};

const fetchNextPage = async () => {
  if (movies.value.length < totalResults.value) {
    currentPage.value += 1;
    await fetchMovies();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    updateDisplayedMovies();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    updateDisplayedMovies();
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  fetchMovies();
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.grid-page {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  justify-content: center;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-controls button {
  margin: 0 10px;
  padding: 5px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-controls button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  margin-top: 20px;
  font-size: 18px;
}

.error {
  color: red;
}

@media (max-width: 767px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
