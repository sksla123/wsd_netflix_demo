<template>
    <div class="horizontal-slider-box">
      <button class="slide-button left" @click="slideLeft" :disabled="atStart">&lt;</button>
      <div class="horizontal-slider-contents-box">
        <div class="slide-wrapper" ref="slideWrapper">
          <div class="slide" :style="{ transform: `translateX(-${slidePosition}px)` }">
            <component 
              v-for="movie in movies" 
              :key="movie.id" 
              :is="isMobile ? PosterMobile : Poster"
              :movie="movie" 
              class="poster-component"
            />
          </div>
        </div>
        <input 
          type="range" 
          class="slide-bar" 
          :min="0" 
          :max="maxSlidePosition" 
          v-model="slidePosition"
          @input="updateSlidePosition"
        >
      </div>
      <button class="slide-button right" @click="slideRight" :disabled="atEnd">&gt;</button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
  const posterWidth = ref(200);
  
  const atStart = computed(() => slidePosition.value === 0);
  const atEnd = computed(() => slidePosition.value >= maxSlidePosition.value);
  
  const updateSlidePosition = () => {
    if (slideWrapper.value) {
      const wrapperWidth = slideWrapper.value.clientWidth;
      const slideWidth = props.movies.length * posterWidth.value;
      maxSlidePosition.value = Math.max(0, slideWidth - wrapperWidth);
      slidePosition.value = Math.min(slidePosition.value, maxSlidePosition.value);
    }
  };
  
  const slideLeft = () => {
    slidePosition.value = Math.max(0, slidePosition.value - posterWidth.value);
  };
  
  const slideRight = () => {
    slidePosition.value = Math.min(maxSlidePosition.value, slidePosition.value + posterWidth.value);
  };
  
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768;
    posterWidth.value = isMobile.value ? 150 : 200;
    updateSlidePosition();
  };
  
  watch(() => props.movies, updateSlidePosition);
  
  onMounted(() => {
    checkMobile();
    updateSlidePosition();
    window.addEventListener('resize', checkMobile);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
  });
  </script>
  
<style scoped>
.horizontal-slider-box {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.horizontal-slider-contents-box {
  flex: 1;
  overflow: hidden;
  margin: 0 40px;
}

.slide-wrapper {
  overflow: hidden;
}

.slide {
  display: flex;
  transition: transform 0.3s ease;
}

.poster-component {
  flex: 0 0 auto;
  width: 200px;
  margin-right: 10px;
}

.slide-button {
  width: 40px;
  height: 60px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.horizontal-slider-box:hover .slide-button {
  opacity: 0.8;
}

.slide-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-bar {
  -webkit-appearance: none;
  width: 100%;
  height: 12px;
  background-color: rgba(255,255,255,0);
  outline: none;
  margin-top: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.horizontal-slider-box:hover .slide-bar {
  opacity: 0.6;
}

.slide-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 60px;
  height: 16px;
  background-color: rgba(255,255,255,0.7);
  cursor: pointer;
}

.slide-bar::-moz-range-thumb {
  width: 60px;
  height: 16px;
  background-color: rgba(255,255,255,0.7);
  cursor: pointer;
}

@media (max-width: 768px) {
  .slide-button {
    display: none;
  }

  .horizontal-slider-contents-box {
    margin: 0;
  }

  .poster-component {
    width: 150px;
  }
}
</style>