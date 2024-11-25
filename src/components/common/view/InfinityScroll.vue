<template>
    <RecycleScroller class="infinity-scroll-container" :items="movies" :item-size="itemSize" :buffer="200"
        @visible="loadMoreMovies">
        <template #default="{ item }">
            <div class="poster-container" :style="posterStyle">
                <component :is="isMobile ? PosterMobile : Poster" :movie="item" class="poster-item" />
            </div>
        </template>
    </RecycleScroller>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMovieAndMetaDatas } from '../api/api';
import { addPage2MovieUrl } from '../api/url';
import Poster from './Poster.vue';
import PosterMobile from './PosterMobile.vue';
import { RecycleScroller } from 'vue3-virtual-scroller';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

const LAYOUT = {
    desktop: {
        poster: { width: 220, height: 340 },
        spacing: { gap: 10, padding: 20 }
    },
    mobile: {
        poster: { width: 165, height: 255 },
        spacing: { gap: 5, padding: 10 }
    }
};

const props = defineProps({
    baseURL: { type: String, required: true }
});

const movies = ref([]);
const currentPage = ref(1);
const totalResults = ref(0);
const isMobile = ref(false);
const isLoading = ref(false);

const layout = computed(() => isMobile.value ? LAYOUT.mobile : LAYOUT.desktop);

const itemSize = computed(() => layout.value.poster.height + layout.value.spacing.gap);

const posterStyle = computed(() => ({
    width: `${layout.value.poster.width}px`,
    height: `${layout.value.poster.height}px`,
    margin: `${layout.value.spacing.gap / 2}px`
}));

const loadMoreMovies = async () => {
    if (isLoading.value || movies.value.length >= totalResults.value) return;

    isLoading.value = true;
    try {
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

onMounted(() => {
    const resizeObserver = new ResizeObserver(() => {
        isMobile.value = window.innerWidth < 768;
    });

    resizeObserver.observe(document.body);
    loadMoreMovies();

    onUnmounted(() => {
        resizeObserver.disconnect();
    });
});
</script>

<style scoped>
.infinity-scroll-container {
    height: 100%;
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
</style>