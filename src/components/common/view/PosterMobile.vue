<template>
  <div class="poster-container-mobile" 
       @touchstart="startTouch" 
       @touchend="endTouch"
       @mouseenter="startHover"
       @mouseleave="endHover">
    <div class="poster-mobile" :class="{ 'touched': isTouched, 'hovered': isHovered }" @click="toggleWishlist">
      <div class="poster-content-mobile">
        <div class="loading-overlay-mobile" v-if="!imageLoaded">
          <font-awesome-icon :icon="['fas', 'spinner']" spin class="spinner-mobile" />
        </div>
        <img :src="posterUrl" @load="imageLoaded = true" @error="handleImageError" alt="Movie Poster" :class="{ 'loaded': imageLoaded }">
      </div>
      <div class="wishlist-star-mobile">
        <font-awesome-icon :icon="['fas', 'star']" :class="{ 'wishlist': isInWishlist }" />
      </div>
    </div>
    <h3 class="movie-title-mobile" :class="{ 'touched': isTouched, 'hovered': isHovered }">{{ title }}</h3>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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

const posterUrl = computed(() => {
  if (posterPath) {
    return getMovieImageUrl(posterPath, 'w342');
  }
  return '/path/to/placeholder-image.jpg';
});

const imageLoaded = ref(false);
const isTouched = ref(false);
const isHovered = ref(false);

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

const startHover = () => {
  isHovered.value = true;
};

const endHover = () => {
  isHovered.value = false;
};

onMounted(() => {
  if (userEmail.value) {
    store.dispatch('loadWishlist', userEmail.value);
  }
});
</script>

<style scoped>
.poster-container-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  margin: 5px;
  transition: all 0.3s ease;
}

.poster-mobile {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 225px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.poster-mobile.touched,
.poster-mobile.hovered {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.poster-content-mobile {
  position: relative;
  width: 100%;
  height: 100%;
}

.loading-overlay-mobile {
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

.spinner-mobile {
  font-size: 1.5rem;
  color: #ffffff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.poster-mobile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.poster-mobile img.loaded {
  opacity: 1;
}

.wishlist-star-mobile {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 10;
  width: 15%;
  height: 0;
  padding-bottom: 15%;
  pointer-events: none;
}

.wishlist-star-mobile .fa-star {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #808080;
  transition: color 0.3s ease;
}

.wishlist-star-mobile .fa-star.wishlist {
  color: #FFD700;
}

.movie-title-mobile {
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

.movie-title-mobile.touched,
.movie-title-mobile.hovered {
  transform: translateY(5px);
}
</style>