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
import PosterMobile from './PosterMobile.vue';

const LAYOUT = {
    poster: { width: 150, height: 225 },
    spacing: { gap: 10, padding: 20, inner: 8 }
};

const props = defineProps({
    movies: { type: Array, required: true }
});

const scrollContainer = ref(null);
const containerWidth = ref(0);
const containerHeight = ref(0);
const lastScrollTop = ref(0);
const isButtonClicked = ref(false);
const scrollContainerHeight = ref(0);

const grid = computed(() => {
    const availableWidth = containerWidth.value - (LAYOUT.spacing.padding * 2);
    const columns = Math.max(1, Math.floor((availableWidth + LAYOUT.spacing.gap) / (LAYOUT.poster.width + LAYOUT.spacing.gap)));
    const availableHeight = scrollContainerHeight.value;
    const rows = Math.max(1, Math.floor(availableHeight / (LAYOUT.poster.height + LAYOUT.spacing.gap))) + 2;
    return { columns, rows };
});

const visibleMovies = ref([]);

const updateVisibleMovies = () => {
    const { rows, columns } = grid.value;
    const maxPosters = rows * columns;
    visibleMovies.value = props.movies.slice(0, maxPosters);
};

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
    const totalPosters = Math.min(rows * columns, props.movies.length);
    const totalRows = Math.ceil(totalPosters / columns);
    containerHeight.value = (totalRows * LAYOUT.poster.height) + 
                            ((totalRows - 1) * LAYOUT.spacing.gap) + 
                            (LAYOUT.spacing.padding * 2);
};

const updateContainerSize = () => {
    if (scrollContainer.value) {
        containerWidth.value = scrollContainer.value.clientWidth;
        scrollContainerHeight.value = scrollContainer.value.clientHeight;
        updateContainerHeight();
    }
};

const handleScroll = () => {
    const container = scrollContainer.value;
    if (!container) return;

    const currentScrollTop = container.scrollTop;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        scrollContainerHeight.value += (2 * LAYOUT.poster.height) + (2 * LAYOUT.spacing.gap);
        updateContainerHeight();
    }

    lastScrollTop.value = currentScrollTop;
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
    // Button animation start logic
};

const endButtonAnimation = () => {
    // Button animation end logic
};

onMounted(() => {
    updateContainerSize();
    scrollContainer.value.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateContainerSize);
});

watch(() => grid.value, () => {
    updateVisibleMovies();
    updateContainerHeight();
}, { immediate: true, deep: true });

watch(() => props.movies, () => {
    updateVisibleMovies();
    updateContainerHeight();
}, { immediate: true, deep: true });

onUnmounted(() => {
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
    0% { transform: scale(1); }
    50% { transform: scale(0.9); }
    100% { transform: scale(1); }
}
</style>