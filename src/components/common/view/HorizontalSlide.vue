<template>
    <div class="horizontal-slide-container">
      <button class="slide-button left" @click="slideLeft" :disabled="atStart">&lt;</button>
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
      <button class="slide-button right" @click="slideRight" :disabled="atEnd">&gt;</button>
      <input 
        type="range" 
        class="slide-bar" 
        :min="0" 
        :max="maxSlidePosition" 
        v-model="slidePosition"
        @input="updateSlidePosition"
      >
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
  
  .poster-component {
    flex: 0 0 auto;
    width: 200px;
    margin-right: 10px;
  }
  
  .slide-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 2.5%;
    height: 25%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    cursor: pointer;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .horizontal-slide-container:hover .slide-button {
    opacity: 1;
  }
  
  .slide-button.left {
    left: 0;
  }
  
  .slide-button.right {
    right: 0;
  }
  
  .slide-button:disabled {
    opacity: 0;
    cursor: not-allowed;
  }
  
  .slide-bar {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    outline: none;
    margin-top: 10px;
  }
  
  .slide-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 50px;
    height: 10px;
    background: rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }
  
  .slide-bar::-moz-range-thumb {
    width: 50px;
    height: 10px;
    background: rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .slide-button {
      display: none;
    }
  
    .poster-component {
      width: 150px;
    }
  }
  </style>