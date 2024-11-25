<template>
    <div class="infinity-scroll-container" ref="scrollContainer">
        <div class="white-container" :style="containerStyle">
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
    if (!init_flag && movies.value.length >= totalResults.value) return;
    // if (movies.value.length >= totalResults.value) return;

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

    for (let i = 0; i< 9; i++) {
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
    height: 110%;
    gap: 10px;
    /* LAYOUT.spacing.gap과 동일하게 설정 */
    padding: 20px;
    /* LAYOUT.spacing.padding과 동일하게 설정 */
}

.poster-wrapper {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
}

.scroll-top-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: red;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.scroll-top-button i {
    font-size: 1.5rem;
}
</style>