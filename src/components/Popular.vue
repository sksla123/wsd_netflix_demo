<template>
  <div class="popular-container">
    <h2 class="title">인기 영화</h2>
    <div class="table-wrapper">
      <PageTable 
        v-if="apiKey && baseURL"
        :apiKey="apiKey"
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
import { computed } from 'vue';
import { useStore } from 'vuex';
import PageTable from '../components/common/view/PageTable.vue';
import { getBaseMovieUrl } from '../components/common/api/url';

const store = useStore();
const apiKey = computed(() => store.state.userAPIKey);
const baseURL = computed(() => {
  if (!apiKey.value) return null;
  return "/movie/popular";
});
</script>

<style scoped>
.popular-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.title {
  color: #ffffff;
  font-size: 2rem;
  margin: 20px;
  font-weight: bold;
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
    font-size: 1.5rem;
    margin: 15px;
  }

  .error-message h3 {
    font-size: 1.2rem;
  }

  .error-message p {
    font-size: 0.9rem;
  }
}
</style>
