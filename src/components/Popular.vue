<template>
  <div class="popular-container" :style="containerStyle">
    <div class="view-switch">
      <button 
        class="switch-button" 
        :class="{ active: !isInfinityView }"
        @click="isInfinityView = false"
      >
        <i class="pi pi-table"></i>
      </button>
      <button 
        class="switch-button" 
        :class="{ active: isInfinityView }"
        @click="isInfinityView = true"
      >
        <i class="pi pi-align-justify"></i>
      </button>
    </div>
    <div class="table-wrapper">
      <component 
        :is="currentView"
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
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import PageTable from '../components/common/view/PageTable.vue';
import InfinityScroll from '../components/common/view/InfinityScroll.vue';
import { getBaseMovieUrl } from '../components/common/api/url';

const props = defineProps({
  availableHeight: Number,
  availableWidth: Number
});

const store = useStore();
const isInfinityView = ref(false);

const apiKey = computed(() => store.state.userAPIKey);
const baseURL = computed(() => {
  if (!apiKey.value) return null;
  return getBaseMovieUrl(apiKey.value, "/movie/popular");
});

const currentView = computed(() => 
  isInfinityView.value ? InfinityScroll : PageTable
);

const containerStyle = computed(() => ({
  height: `${props.availableHeight}px`,
  maxHeight: `${props.availableHeight}px`
}));
</script>

<style scoped>
.popular-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.view-switch {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px auto;
}

.switch-button {
  padding: 8px 16px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.5);
}

.switch-button.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.switch-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.switch-button i {
  font-size: 1.2rem;
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
  .view-switch {
    margin: 15px auto;
  }

  .switch-button {
    padding: 6px 12px;
  }

  .switch-button i {
    font-size: 1rem;
  }

  .error-message h3 {
    font-size: 1.2rem;
  }

  .error-message p {
    font-size: 0.9rem;
  }
}
</style>