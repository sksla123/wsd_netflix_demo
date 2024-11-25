<template>
  <div class="popular-container">
    <h1>지금 뜨는 콘텐츠</h1>
    <Grid
      :available-width="availableWidth"
      :available-height="availableHeight"
      endpoint="/movie/popular"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Grid from './common/view/GridPage.vue';

const availableWidth = ref(0);
const availableHeight = ref(0);

const updateDimensions = () => {
  availableWidth.value = window.innerWidth - 40; // 좌우 여백 20px씩
  availableHeight.value = window.innerHeight - 100; // 상단 제목과 여백 고려
};

onMounted(() => {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
});
</script>

<style scoped>
.popular-container {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #ffffff;
  font-size: 2rem;
}
</style>