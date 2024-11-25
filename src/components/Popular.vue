<template>
  <div class="popular-container" :style="{ height: `${availableHeight}px`, maxHeight: `${availableHeight}px` }">
    <h2 class="title">지금 뜨는 콘텐츠</h2>
    <div class="table-wrapper">
      <PageTable 
        v-if="apiKey && baseURL"
        :baseURL="baseURL"
      />
      <div v-else class="error-message">
        <h3>API 키가 설정되지 않았습니다</h3>
        <p>설정 메뉴에서 TMDB API 키를 설정해주세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import { useStore } from 'vuex';
import PageTable from '../components/common/view/PageTable.vue';
import { getBaseMovieUrl } from '../components/common/api/url';

const props = defineProps({
  availableHeight: Number,
  availableWidth: Number
});

const store = useStore();
const apiKey = computed(() => store.state.userAPIKey);
const baseURL = computed(() => {
  if (!apiKey.value) return null;
  return getBaseMovieUrl(apiKey.value, "/movie/popular");
});
</script>

<style scoped>
.popular-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.title {
  color: #ffffff;
  font-size: 2rem; /* 글자 크기를 줄였습니다 */
  margin: 20px auto; /* 위아래 간격을 줄였습니다 */
  font-weight: bold;
  text-align: center; /* 텍스트를 가운데 정렬 */
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
  text-align: center;
}

.error-message h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #ff4444;
}

.error-message p {
  font-size: 1rem;
  color: #cccccc;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem; /* 모바일 화면에서의 글자 크기 조정 */
    margin: 15px auto; /* 모바일에서도 간격 조정 */
    text-align: center; /* 모바일에서도 텍스트 가운데 정렬 */
  }

  .error-message h3 {
    font-size: 1.2rem;
  }

  .error-message p {
    font-size: 0.9rem;
  }
}
</style>