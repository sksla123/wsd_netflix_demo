<template>
    <div class="infinity-scroll-container" ref="scrollContainer">
        <div class="white-container" :style="{ ...containerStyle, height: `${containerHeight}px` }">
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
    spacing: { gap: 10, padding: 20, inner: 8 }
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
const containerHeight = ref(0); // 현재 white-container의 높이
const initialHeight = ref(0); // 최초 white-container의 높이
const lastScrollTop = ref(0); // 마지막 스크롤 위치 저장
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

// white-container의 높이를 업데이트하는 함수
const updateContainerSize = () => {
    if (scrollContainer.value) {
        containerWidth.value = scrollContainer.value.clientWidth;
        const newHeight = scrollContainer.value.clientHeight; // 현재 infinity-scroll-container의 높이
        initialHeight.value = newHeight; // 최초 높이를 업데이트
        if (containerHeight.value === 0) {
            containerHeight.value = newHeight; // 초기 설정
        }
    }
};

// 스크롤 이벤트가 발생할 때 white-container의 height를 조정
const handleScroll = () => {
    const container = scrollContainer.value;
    if (!container) return;

    const currentScrollTop = container.scrollTop; // 현재 스크롤 위치

    if (currentScrollTop > lastScrollTop.value) {
        // 아래로 스크롤 -> height 증가
        containerHeight.value += currentScrollTop - lastScrollTop.value;
    } else if (currentScrollTop < lastScrollTop.value) {
        // 위로 스크롤 -> height 감소
        containerHeight.value -= lastScrollTop.value - currentScrollTop;
        if (containerHeight.value < initialHeight.value) {
            containerHeight.value = initialHeight.value; // 최초 높이 이하로 줄어들지 않도록 설정
        }
    }

    lastScrollTop.value = currentScrollTop; // 마지막 스크롤 위치 업데이트

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        loadMoreMovies();
    }
};

const loadMoreMovies = async () => {
    if (!init_flag.value && movies.value.length >= totalResults.value) return;

    const url = addPage2MovieUrl(props.baseURL, currentPage.value);
    const { movies: newMovies, totalResults: total } = await getMovieAndMetaDatas(url);

    movies.value.push(...newMovies);
    totalResults.value = total;
    currentPage.value += 1;
};

const scrollToTop = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
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

    // 초기 크기 업데이트 및 이벤트 리스너 등록
    updateContainerSize();

    scrollContainer.value.addEventListener('scroll', handleScroll);

    window.addEventListener('resize', updateContainerSize); // 창 크기 변경 시 호출
});

onUnmounted(() => {
    // 이벤트 리스너 제거
    window.removeEventListener('resize', updateContainerSize);

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
    /* infinity-scroll-container의 높이 */
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
}

.scroll-top-button i {
    font-size: 1.5rem;
}
</style>