<template>
  <div class="poster-container" @touchstart="startTouch" @touchend="endTouch">
    <div class="poster" :class="{ 'touched': isTouched }" @click="toggleWishlist">
      <div class="poster-content">
        <div class="loading-overlay" v-if="!imageLoaded">
          <font-awesome-icon :icon="['fas', 'spinner']" spin class="spinner" />
        </div>
        <img :src="posterUrl" @load="imageLoaded = true" @error="handleImageError" alt="Movie Poster" :class="{ 'loaded': imageLoaded }">
      </div>
      <div class="wishlist-star" :class="{ 'small': isSmallScreen }">
        <font-awesome-icon :icon="['fas', 'star']" :class="{ 'wishlist': isInWishlist }" />
      </div>
    </div>
    <h3 class="movie-title" :class="{ 'touched': isTouched }">{{ title }}</h3>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { getMovieImageUrl } from '../api/url';

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
});

const store = useStore();
const userEmail = computed(() => store.state.userEmail);
const { id, title, posterPath, genreIds } = props.movie;

const imageLoaded = ref(false);
const isTouched = ref(false);
const isSmallScreen = ref(false);

const posterUrl = computed(() => {
  const size = isSmallScreen.value ? 'w185' : 'w342';
  return posterPath ? getMovieImageUrl(posterPath, size) : '/path/to/placeholder-image.jpg';
});

const isInWishlist = computed(() => {
  return store.getters.isInWishlist(userEmail.value, id);
});

const toggleWishlist = async () => {
  if (isInWishlist.value) {
    await store.dispatch('removeFromWishlist', { userEmail: userEmail.value, movieId: id });
  } else {
    await store.dispatch('addToWishlist', { userEmail: userEmail.value, movieId: id, genreIds });
  }
};

const handleImageError = () => {
  posterUrl.value = '/path/to/placeholder-image.jpg';
  imageLoaded.value = true;
};

const startTouch = () => {
  isTouched.value = true;
};

const endTouch = () => {
  isTouched.value = false;
};

const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 768;
};

onMounted(() => {
  if (userEmail.value) {
    store.dispatch('loadWishlist', userEmail.value);
  }
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style scoped>
.poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  margin: 5px;
  transition: all 0.3s ease;
}

.poster {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 225px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.poster.touched {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.poster-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(80, 80, 80, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.spinner {
  font-size: 1.5rem;
  color: #ffffff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.poster img.loaded {
  opacity: 1;
}

.wishlist-star {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 10;
  width: 15%;
  height: 0;
  padding-bottom: 15%;
  pointer-events: none;
}

.wishlist-star.small {
  width: 10%;
  padding-bottom: 10%;
}

.wishlist-star .fa-star {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #808080;
  transition: color 0.3s ease;
}

.wishlist-star .fa-star.wishlist {
  color: #FFD700;
}

.movie-title {
  margin-top: 5px;
  text-align: center;
  font-size: 0.9rem;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
  transition: all 0.3s ease;
}

.movie-title.touched {
  transform: translateY(5px);
}

@media (max-width: 767px) {
  .poster-container {
    width: 120px;
  }

  .poster {
    height: 180px;
  }

  .movie-title {
    font-size: 0.8rem;
  }
}
</style>