<template>
  <div class="wishlist-container" :style="containerStyle">
    <div class="content-wrapper">
      <div v-if="loading" class="loading-message">Loading...</div>
      <template v-else>
        <InfinityScroll2 
          v-if="movies.length > 0" 
          :movies="movies" 
          :availableHeight="scrollHeight" 
        />
        <p v-else class="empty-wishlist-message">위시리스트가 비어있습니다.</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import InfinityScroll2 from './common/view/PageTable2.vue';

const props = defineProps({
  availableHeight: {
    type: Number,
    required: true
  },
  availableWidth: {
    type: Number,
    required: true
  }
});

const store = useStore();
const movies = ref([]);
const loading = ref(true);

const containerStyle = computed(() => ({
  height: `${props.availableHeight}px`,
  maxHeight: `${props.availableHeight}px`
}));

const scrollHeight = computed(() => props.availableHeight);

const transformWishlistToArray = (wishlist) => {
  return Object.entries(wishlist).map(([movieId, movieData]) => ({
    id: movieId,
    ...movieData
  }));
};

const loadWishlist = async () => {
  loading.value = true;
  const userEmail = store.state.userEmail;
  const userWishlist = store.state.wishlist[userEmail] || {};
  movies.value = transformWishlistToArray(userWishlist);
  loading.value = false;
};

const handleStorageChange = (event) => {
  if (event.key === 'UserWishlist') {
    store.dispatch('loadWishlist', store.state.userEmail);
  }
};

onMounted(() => {
  loadWishlist();
  window.addEventListener('storage', handleStorageChange);
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
});

watch(() => store.state.wishlist, loadWishlist, { deep: true });
</script>

<style scoped>
.wishlist-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  margin-top: 30px;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  color: #fff;
  margin-top: 50px;
}

.empty-wishlist-message {
  text-align: center;
  font-size: 18px;
  color: #fff;
  margin-top: 50px;
}

@media (max-width: 768px) {
  .loading-message,
  .empty-wishlist-message {
    font-size: 16px;
    margin-top: 30px;
  }
}
</style>