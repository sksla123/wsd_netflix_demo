<template>
    <div class="table-container" ref="tableContainer">
        <div class="white-container" :style="containerStyle">
            <div v-for="movie in displayMovies" :key="movie.id" class="poster-container" :style="posterStyle">
                <PosterMobile :movie="movie" class="poster-item" />
            </div>
        </div>
        <nav class="pagination">
            <button @click="changePage(currentPage - 1)" :disabled="isFirstPage" class="page-button">이전</button>
            <template v-for="(item, index) in displayedPageNumbers" :key="index">
                <button v-if="typeof item === 'number'" @click="changePage(item)"
                    :class="['page-number', { active: item === currentPage }]">
                    {{ item }}
                </button>
                <span v-else class="ellipsis">{{ item }}</span>
            </template>
            <button @click="changePage(currentPage + 1)" :disabled="isLastPage" class="page-button">다음</button>
        </nav>
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

// State
const currentPage = ref(1);
const tableContainer = ref(null);
const grid = ref({ columns: 0, rows: 0 });

// Computed
const itemsPerPage = computed(() => grid.value.columns * grid.value.rows);
const totalPages = computed(() => Math.ceil(props.movies.length / itemsPerPage.value) || 1);
const isFirstPage = computed(() => currentPage.value === 1);
const isLastPage = computed(() => currentPage.value === totalPages.value);

const displayMovies = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const movies = props.movies.slice(start, start + itemsPerPage.value);
    
    if (movies.length === 0 && currentPage.value > 1) {
        currentPage.value = currentPage.value - 1;
        return props.movies.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value);
    }
    
    return movies;
});

const posterStyle = computed(() => ({
    width: `${LAYOUT.poster.width}px`,
    height: `${LAYOUT.poster.height}px`,
    padding: `${LAYOUT.spacing.inner}px`
}));

const containerStyle = computed(() => {
    const { width, height } = LAYOUT.poster;
    const { gap } = LAYOUT.spacing; // Removed padding from here
    const { columns, rows } = grid.value;

    const contentWidth = (columns * width) + ((columns - 1) * gap);
    const contentHeight = (rows * height) + ((rows - 1) * gap);

    return {
        width: `${contentWidth}px`,
        height: `${contentHeight}px`,
        gap: `${gap}px`
    };
});

const displayedPageNumbers = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    const result = [];

    if (current <= 2) {
        for (let i = 1; i <= Math.min(3, total); i++) {
            result.push(i);
        }
        if (total > 3) {
            result.push('...');
        }
    } else if (current >= total - 1) {
        if (total > 3) {
            result.push('...');
        }
        for (let i = Math.max(1, total - 2); i <= total; i++) {
            result.push(i);
        }
    } else {
        result.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
            result.push(i);
        }
        result.push('...');
    }

    return result;
});

// Methods
const updateLayout = () => {
    if (!tableContainer.value) return;

    const { width, height } = LAYOUT.poster;
    const { gap } = LAYOUT.spacing; // Removed padding from here
    const containerPadding = 40;
    const paginationHeight = 80;

    const availableWidth = tableContainer.value.clientWidth - containerPadding;
    const availableHeight = tableContainer.value.clientHeight - paginationHeight;

    grid.value = {
        columns: Math.max(1, Math.floor((availableWidth + gap) / (width + gap))),
        rows: Math.max(1, Math.floor((availableHeight + gap) / (height + gap)))
    };
};

const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages.value) return;
    currentPage.value = newPage;
};

// Watch for changes in itemsPerPage
watch(itemsPerPage, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
    }
});

// Lifecycle
onMounted(() => {
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateLayout);
    });

    resizeObserver.observe(tableContainer.value);

    onUnmounted(() => resizeObserver.disconnect());
});
</script>

<style scoped>
.table-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    position: relative;
}

.white-container {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    margin: auto; /* Center the container */
}

.poster-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.poster-item {
    width: 100%;
    height: 100%;
}

.pagination {
    display: flex;
    justify-content: center;
}

.page-button,
.page-number {
    min-width: 40px;
}

.page-button:hover:not(:disabled),
.page-number:hover:not(.active) {
}

.page-button:disabled {}

.page-number.active {}

.ellipsis {}

@media (max-width: 768px) {}
</style>