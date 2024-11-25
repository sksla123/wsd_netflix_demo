<template>
    <div class="infinity-scroll-container" ref="scrollContainer">
      <div class="white-container" :style="{ ...containerStyle, height: `${containerHeight.value}px` }">
        <div v-for="movie in movies" :key="movie.id" class="poster-wrapper" :style="posterStyle">
          <PosterMobile :movie="movie" class="poster-item" />
        </div>
      </div>
  
      <button class="scroll-top-button" @click="scrollToTop">
        <i class="pi pi-angle-double-up"></i>
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useStore } from 'vuex';
  import { getMovieAndMetaDatas } from '../api/api';
  import { addPage2MovieUrl } from '../api/url';
  import PosterMobile from './PosterMobile.vue';
  import { useElementSize } from '@vueuse/core';
  
  const LAYOUT = {
    poster: { width: 150, height: 225 },
    spacing: { gap: 10, padding: 20 }
  };
  
  const props = defineProps({
    baseURL: { type: String, required: true }
  });
  
  const store = useStore();
  const movies = ref([]);
  const totalResults = ref(0);
  const currentPage = ref(1);
  const scrollContainer = ref(null);
  const containerWidth = ref(0);
  const init_flag = ref(true);
  
  const { height: containerHeight } = useElementSize(scrollContainer);
  
  const grid = computed(() => {
    const availableWidth = containerWidth.value - (LAYOUT.spacing.padding * 2);
    const columns = Math.max(1, Math.floor((availableWidth + LAYOUT.spacing.gap) / (LAYOUT.poster.width + LAYOUT.spacing.gap)));
    return { columns };
  });
  
  const containerStyle = computed(() => {
    const { columns } = grid.value;
    const width = (columns * LAYOUT.poster.width) + ((columns - 1) * LAYOUT.spacing.gap);
    return {
      width: `${width + LAYOUT.spacing.padding * 2}px`,
      padding: `${LAYOUT.spacing.padding}px`,
      gap: `${LAYOUT.spacing.gap}px`
    };
  });
  
  const posterStyle = computed(() => ({
    width: `${LAYOUT.poster.width}px`,
    height: `${LAYOUT.poster.height}px`
  }));
  
  const loadMoreMovies = async () => {
    if (!init_flag.value && movies.value.length >= totalResults.value) return;
  
    const url = addPage2MovieUrl(props.baseURL, currentPage.value);
    const { movies: newMovies, totalResults: total } = await getMovieAndMetaDatas(url);
  
    movies.value.push(...newMovies);
    totalResults.value = total;
    currentPage.value += 1;
  };
  
  const handleScroll = () => {
    const container = scrollContainer.value;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      loadMoreMovies();
    }
  };
  
  const scrollToTop = () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const updateContainerWidth = () => {
    if (scrollContainer.value) {
      containerWidth.value = scrollContainer.value.clientWidth;
    }
  };
  
  onMounted(async () => {
    const initialData = await getMovieAndMetaDatas(props.baseURL);
    movies.value = initialData.movies;
    totalResults.value = initialData.totalResults;
  
    for (let i = 0; i < 9; i++) {
      await loadMoreMovies();
    }
    
    init_flag.value = false;
  
    scrollContainer.value.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateContainerWidth);
    updateContainerWidth();
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerWidth);
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', handleScroll);
    }
  });
  </script>
  
  <style scoped>
  .infinity-scroll-container {
      position: relative;
      overflow-y: auto;
      height: calc(100vh - 40px);
      display: flex;
      justify-content: center;
  }
  
  .white-container {
      margin-top: 20px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-content: flex-start;
      gap: var(--gap); /* Use CSS variable for consistency */
      padding: var(--padding); /* Use CSS variable for consistency */
  }
  
  .poster-wrapper {
      margin-top: var(--margin-top); /* Use CSS variable for consistency */
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  .scroll-top-button {
      position: fixed;
      bottom: var(--button-bottom-position); /* Use CSS variable for consistency */
      right: var(--button-right-position); /* Use CSS variable for consistency */
      background-color: red;
      color: white;
      border-radius: var(--button-border-radius); /* Use CSS variable for consistency */
      width: var(--button-width); /* Use CSS variable for consistency */
      height: var(--button-height); /* Use CSS variable for consistency */
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  .scroll-top-button i {
     font-size: var(--icon-font-size); /* Use CSS variable for consistency */
  }
  </style>