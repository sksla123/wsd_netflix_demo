<template>
    <div class="scroll-container" ref="scrollContainer">
        <RecycleScroller class="scroller" :items="movies" :item-size="itemSize" key-field="id" v-slot="{ item }"
            @scroll="handleScroll">
            <div class="poster-container">
                <PosterMobile :movie="item" class="poster-item" />
            </div>
        </RecycleScroller>
        <div v-if="isLoading" class="loading">
            Loading...
        </div>
        <button class="top-button" @click="scrollToTop">
            <i class="pi pi-angle-double-up"></i>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RecycleScroller } from 'vue3-virtual-scroller';
import { getMovieAndMetaDatas } from '../api/api';
import { addPage2MovieUrl } from '../api/url';
import PosterMobile from './PosterMobile.vue';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

const LAYOUT = {
    poster: { width: 150, height: 225 },
    spacing: { gap: 10, padding: 10 }
};

const props = defineProps({
    baseURL: { type: String, required: true }
});

// State
const movies = ref([]);
const currentPage = ref(1);
const totalResults = ref(0);
const isLoading = ref(false);
const scrollContainer = ref(null);

// Computed
const itemSize = computed(() => LAYOUT.poster.height + LAYOUT.spacing.gap);

// Methods
const loadMoreMovies = async () => {
    if (isLoading.value || (totalResults.value > 0 && movies.value.length >= totalResults.value)) {
        return;
    }

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

const handleScroll = async (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const scrollThreshold = 100;

    if (scrollHeight - (scrollTop + clientHeight) < scrollThreshold) {
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

// Lifecycle
onMounted(() => {
    loadMoreMovies();
});
</script>

<style scoped>
.scroll-container {
    height: 100%;
    width: 100%;
    position: relative;
    padding: 10px;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.scroller {
    height: 100%;
}

.poster-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    box-sizing: border-box;
}

.poster-item {
    width: 150px;
    height: 225px;
}

.loading {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
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

:deep(.vue-recycle-scroller__item-wrapper) {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
}

@media (max-width: 768px) {
    .top-button {
        bottom: 15px;
        right: 15px;
        width: 35px;
        height: 35px;
    }
}
</style>