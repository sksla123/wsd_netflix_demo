<template>
    <div class="horizontal-slide-container">
        <button class="slide-button left" @click="slideLeft" :disabled="atStart">&lt;</button>
        <div class="slide-wrapper" ref="slideWrapper">
            <div class="slide" :style="{ transform: `translateX(-${slidePosition}px)` }">
                <component v-for="movie in movies" :key="movie.id" :is="isMobile ? PosterMobile : Poster"
                    :movie="movie" />
            </div>
        </div>
        <button class="slide-button right" @click="slideRight" :disabled="atEnd">&gt;</button>
        <input type="range" class="slide-bar" :min="0" :max="maxSlidePosition" v-model="slidePosition"
            @input="updateSlidePosition">
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Poster from './Poster.vue';
import PosterMobile from './PosterMobile.vue';

const props = defineProps({
    movies: {
        type: Array,
        required: true
    }
});

const slideWrapper = ref(null);
const slidePosition = ref(0);
const maxSlidePosition = ref(0);
const isMobile = ref(false);

const atStart = computed(() => slidePosition.value === 0);
const atEnd = computed(() => slidePosition.value >= maxSlidePosition.value);

const updateSlidePosition = () => {
    const wrapperWidth = slideWrapper.value.clientWidth;
    const slideWidth = slideWrapper.value.scrollWidth;
    maxSlidePosition.value = Math.max(0, slideWidth - wrapperWidth);
    slidePosition.value = Math.min(slidePosition.value, maxSlidePosition.value);
};

const slideLeft = () => {
    slidePosition.value = Math.max(0, slidePosition.value - 200);
};

const slideRight = () => {
    slidePosition.value = Math.min(maxSlidePosition.value, slidePosition.value + 200);
};

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
    updateSlidePosition();
    checkMobile();
    window.addEventListener('resize', () => {
        updateSlidePosition();
        checkMobile();
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', updateSlidePosition);
    window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.horizontal-slide-container {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.slide-wrapper {
    overflow: hidden;
}

.slide {
    display: flex;
    transition: transform 0.3s ease;
}

.slide-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    z-index: 10;
}

.slide-button.left {
    left: 0;
}

.slide-button.right {
    right: 0;
}

.slide-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.slide-bar {
    width: 100%;
    margin-top: 10px;
}

@media (max-width: 768px) {
    .slide-button {
        display: none;
    }
}
</style>