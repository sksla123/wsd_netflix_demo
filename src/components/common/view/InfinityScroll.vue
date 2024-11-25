<template>
    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
        <div class="white-container" :style="whiteContainerStyle">
            <div class="poster-container" v-for="movie in movies" :key="movie.id" :style="posterContainerStyle">
                <PosterMobile :movie="movie" class="poster-item" />
            </div>
        </div>
        <div v-if="isLoading" class="loading">Loading...</div>
        <button class="top-button" @click="scrollToTop">
            <i class="pi pi-angle-double-up"></i>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getMovieAndMetaDatas } from '../api/api';
import { addPage2MovieUrl } from '../api/url';
import PosterMobile from './PosterMobile.vue';

const CONFIG = {
    poster: {
        width: 165,
        height: 255,
        gap: 10,
        padding: 20,
        innerPadding: 8
    }
};

const props = defineProps({
    baseURL: { type: String, required: true }
});

// State
const scrollContainer = ref(null);
const movies = ref([]);
const currentPage = ref(1);
const totalResults = ref(0);
const isLoading = ref(false);
const gridDimensions = ref({ columns: 0 });

// containerHeight를 computed로 변경
const containerHeight = computed(() => {
    if (!scrollContainer.value) return window.innerHeight * 2;
    return window.innerHeight * 2;
});

const posterContainerStyle = computed(() => ({
    width: `${CONFIG.poster.width}px`,
    height: `${CONFIG.poster.height}px`,
    padding: `${CONFIG.poster.innerPadding}px`
}));

const whiteContainerStyle = computed(() => {
    const { width, gap, padding } = CONFIG.poster;
    const { columns } = gridDimensions.value;

    const contentWidth = (columns * width) + ((columns - 1) * gap);
    const totalWidth = contentWidth + (padding * 2);

    return {
        width: `${totalWidth}px`,
        height: `${containerHeight.value}px`,
        padding: `${padding}px`,
        gap: `${gap}px`
    };
});

const calculateGridColumns = () => {
    if (!scrollContainer.value) return { columns: 1 };

    const { width, gap, padding } = CONFIG.poster;
    const containerPadding = 40;

    const availableWidth = scrollContainer.value.clientWidth - containerPadding - (padding * 2);
    const columns = Math.floor((availableWidth + gap) / (width + gap));

    return {
        columns: Math.max(1, columns)
    };
};

const updateLayout = () => {
    gridDimensions.value = calculateGridColumns();
};

const loadMoreMovies = async () => {
    if (isLoading.value || movies.value.length >= totalResults.value) return;

    try {
        isLoading.value = true;
        const url = addPage2MovieUrl(props.baseURL, currentPage.value);
        const { movies: newMovies, totalResults: total } = await getMovieAndMetaDatas(url);

        movies.value = [...movies.value, ...newMovies];
        totalResults.value = total;
        currentPage.value++;
    } catch (error) {
        console.error('Failed to load movies:', error);
    } finally {
        isLoading.value = false;
    }
};

const handleScroll = async () => {
    if (!scrollContainer.value || isLoading.value) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
    const scrollThreshold = 100;

    // 현재 화면에 표시되어야 할 포스터 개수 계산
    const { width, height, gap } = CONFIG.poster;
    const containerWidth = scrollContainer.value.clientWidth - (CONFIG.poster.padding * 2);
    const currentContainerHeight = containerHeight.value;

    const columns = Math.floor((containerWidth + gap) / (width + gap));
    const rows = Math.ceil(currentContainerHeight / (height + gap));
    const requiredItems = columns * rows;

    // 현재 표시된 포스터 수가 필요한 수보다 적으면 더 로드
    if (movies.value.length < requiredItems) {
        await loadMoreMovies();
    }

    // 스크롤이 하단에 가까워지면 컨테이너 높이 증가 및 추가 로드
    if (scrollHeight - (scrollTop + clientHeight) < scrollThreshold) {
        if (movies.value.length >= totalResults.value) return;
        containerHeight.value = containerHeight.value + window.innerHeight;
        await loadMoreMovies();
    }
};

const scrollToTop = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

onMounted(async () => {
    updateLayout();
    await loadMoreMovies();

    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateLayout);
    });

    resizeObserver.observe(scrollContainer.value);

    onUnmounted(() => {
        resizeObserver.disconnect();
    });
});
</script>

<style scoped>
.scroll-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
}

.white-container {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
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
}

.loading {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 20px;
    z-index: 1000;
}

.top-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #ff0000;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: opacity 0.3s;
}

.top-button i {
    color: #000000;
    font-size: 1.2rem;
}

.top-button:hover {
    opacity: 0.8;
}

@media (max-width: 768px) {
    .scroll-container {
        padding: 10px;
    }

    .white-container {
        padding: 10px;
        gap: 5px;
    }

    .top-button {
        bottom: 15px;
        right: 15px;
        width: 35px;
        height: 35px;
    }
}
</style>