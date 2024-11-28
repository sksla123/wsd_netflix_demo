<template>
    <div class="infinity-scroll-container" ref="scrollContainer">
        <div class="white-container" :style="{ ...containerStyle, height: `${containerHeight}px` }">
            <div v-for="movie in visibleMovies" :key="movie.id" class="poster-wrapper" :style="posterStyle">
                <PosterMobile :movie="movie" class="poster-item" />
            </div>
        </div>

        <button class="scroll-top-button" @click="scrollToTop" @mouseenter="startButtonAnimation"
            @mouseleave="endButtonAnimation" :class="{ 'button-clicked': isButtonClicked }">
            <i class="pi pi-angle-double-up"></i>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
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

const store = useStore();
const moviesMap = ref(new Map());
const totalResults = ref(0);
const currentPage = ref(1);
const scrollContainer = ref(null);
const containerWidth = ref(0);
const containerHeight = ref(0);
const initialHeight = ref(0);
const lastScrollTop = ref(0);
const init_flag = ref(true);
const isButtonClicked = ref(false);
const scrollContainerHeight = ref(0);

const grid = computed(() => {
    const availableWidth = containerWidth.value - (LAYOUT.spacing.padding * 2);
    const columns = Math.max(1, Math.floor((availableWidth + LAYOUT.spacing.gap) / (LAYOUT.poster.width + LAYOUT.spacing.gap)));
    const availableHeight = scrollContainerHeight.value;
    const rows = Math.max(1, Math.floor(availableHeight / (LAYOUT.poster.height + LAYOUT.spacing.gap))) + 2;
    return { columns, rows };
});

const movies = computed(() => Array.from(moviesMap.value.values()));

const visibleMovies = computed(() => {
    const { rows, columns } = grid.value;
    const maxPosters = rows * columns;
    return movies.value.slice(0, maxPosters);
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

const updateContainerHeight = () => {
    const { rows, columns } = grid.value;
    const totalPosters = Math.min(rows * columns, movies.value.length);
    const totalRows = Math.ceil(totalPosters / columns);
    const calculatedHeight = (totalRows * LAYOUT.poster.height) + 
                            ((totalRows - 1) * LAYOUT.spacing.gap) + 
                            (LAYOUT.spacing.padding * 2);
    
    // 화면 높이와 계산된 높이 중 큰 값을 선택
    containerHeight.value = Math.max(calculatedHeight, scrollContainerHeight.value);
};

const updateContainerSize = () => {
    if (scrollContainer.value) {
        containerWidth.value = scrollContainer.value.clientWidth;
        scrollContainerHeight.value = scrollContainer.value.clientHeight;
        updateContainerHeight();
    }
};

const handleScroll = async () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        await loadMoreMovies();
    }

    const container = scrollContainer.value;
    if (!container) return;

    const currentScrollTop = container.scrollTop;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        await loadMoreMovies();
        scrollContainerHeight.value += (2 * LAYOUT.poster.height) + (2 * LAYOUT.spacing.gap);
        updateContainerHeight();
    }

    lastScrollTop.value = currentScrollTop;
};

const loadMoreMovies = async () => {
    if (!init_flag.value && moviesMap.value.size >= totalResults.value) return;

    const { rows, columns } = grid.value;
    const requiredMovies = (rows * columns) + 20;

    while (moviesMap.value.size < requiredMovies) {
        const url = addPage2MovieUrl(props.baseURL, currentPage.value);
        const { movies: newMovies, totalResults: total } = await getMovieAndMetaDatas(url);

        newMovies.forEach(movie => {
            if (!moviesMap.value.has(movie.id)) {
                moviesMap.value.set(movie.id, movie);
            }
        });

        totalResults.value = total;
        currentPage.value += 1;

        if (moviesMap.value.size >= totalResults.value) break;
    }

    updateContainerHeight();
};

const scrollToTop = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
    }
    isButtonClicked.value = true;
    setTimeout(() => {
        isButtonClicked.value = false;
    }, 300);
};

const startButtonAnimation = () => {
    // 버튼 애니메이션 시작 로직
};

const endButtonAnimation = () => {
    // 버튼 애니메이션 종료 로직
};

onMounted(async () => {
    await loadMoreMovies();
    init_flag.value = false;

    updateContainerSize();
    scrollContainer.value.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateContainerSize);
    window.addEventListener('scroll', handleScroll);
});

watch(() => grid.value, (newGrid, oldGrid) => {
    // console.log('Grid changed:', newGrid);
    // console.log('Old Grid:', oldGrid);
    updateContainerHeight();
}, { immediate: true, deep: true });

onUnmounted(() => {
    window.removeEventListener('resize', updateContainerSize);
    window.removeEventListener('scroll', handleScroll);
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
    clip-path: inset(0 0 0 0);
    overflow: hidden;
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
    right: 3%;
    background-color: red;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
}

.scroll-top-button:hover {
    transform: scale(1.1);
}

.scroll-top-button.button-clicked {
    animation: clickAnimation 0.3s ease;
}

.scroll-top-button i {
    font-size: 1.5rem;
}

@keyframes clickAnimation {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(0.9);
    }

    100% {
        transform: scale(1);
    }
}
</style>