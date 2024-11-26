<template>
  <div class="wishlist-container">
    <h1>My Wishlist</h1>
    <div v-if="loading">Loading...</div>
    <template v-else>
      <InfinityScroll2 v-if="movies.length > 0" :movies="movies" />
      <p v-else class="empty-wishlist-message">위시리스트가 비어있습니다.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import InfinityScroll2 from './common/view/InfinityScroll2.vue';

const store = useStore();
const movies = ref([]);
const loading = ref(true);

const transformWishlistToArray = (wishlist) => {
  return Object.entries(wishlist).map(([movieId, movieData]) => ({
    id: movieId,
    ...movieData
  }));
};

onMounted(async () => {
  const userEmail = store.state.userEmail;
  await store.dispatch('loadWishlist', userEmail);
  const userWishlist = store.state.wishlist[userEmail] || {};
  movies.value = transformWishlistToArray(userWishlist);
  loading.value = false;
});
</script>

<style scoped>
.wishlist-container {
  padding: 20px;
}

.empty-wishlist-message {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-top: 50px;
}
</style>