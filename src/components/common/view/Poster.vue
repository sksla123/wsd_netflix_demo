<template>
    <div class="poster-container" @mouseover="isHovered = true" @mouseleave="isHovered = false">
      <div class="poster" :class="{ 'hovered': isHovered }">
        <div v-if="!imageLoaded" class="loading">
          <font-awesome-icon :icon="['fas', 'spinner']" spin />
        </div>
        <img 
          v-show="imageLoaded" 
          :src="posterUrl" 
          @load="imageLoaded = true" 
          @error="handleImageError"
          alt="Movie Poster"
        >
        <div class="wishlist-star" @click.stop="toggleWishlist">
          <font-awesome-icon :icon="['fas', 'star']" :class="{ 'wishlist': isInWishlist }" />
        </div>
      </div>
      <h3 class="movie-title">{{ title }}</h3>
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
  
  const { id, title, posterPath, genre_ids } = props.movie;
  const posterUrl = computed(() => {
    if (posterPath) {
      return getMovieImageUrl(posterPath, 'w500');
    }
    return '/path/to/placeholder-image.jpg'; // 플레이스홀더 이미지 경로
  });
  const imageLoaded = ref(false);
  const isHovered = ref(false);
  const isInWishlist = ref(false);
  
  const checkWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('UserWishlist') || '{}');
    isInWishlist.value = wishlist[userEmail.value]?.[id] !== undefined;
  };
  
  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('UserWishlist') || '{}');
    if (!wishlist[userEmail.value]) {
      wishlist[userEmail.value] = {};
    }
    
    if (isInWishlist.value) {
      delete wishlist[userEmail.value][id];
    } else {
      wishlist[userEmail.value][id] = genre_ids;
    }
    
    localStorage.setItem('UserWishlist', JSON.stringify(wishlist));
    isInWishlist.value = !isInWishlist.value;
  };
  
  const handleImageError = () => {
    posterUrl.value = '/path/to/placeholder-image.jpg'; // 이미지 로드 실패 시 플레이스홀더 이미지 사용
    imageLoaded.value = true;
  };
  
  onMounted(() => {
    console.log('Received movie object:', props.movie);
    checkWishlist();
  });
  </script>
  
  <style scoped>
  .poster-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px; /* 포스터 컨테이너의 너비 설정 */
    margin: 10px;
  }
  
  .poster {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    width: 100%;
    height: 300px; /* 포스터 높이 설정 */
  }
  
  .poster.hovered {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  .poster img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 이미지 비율 유지 */
    display: block;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
  }
  
  .wishlist-star {
    position: absolute;
    top: 10px;
    left: 10px;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 5px;
  }
  
  .wishlist-star .fa-star {
    color: #d3d3d3;
  }
  
  .wishlist-star .fa-star.wishlist {
    color: #ffd700;
  }
  
  .movie-title {
    margin-top: 10px;
    text-align: center;
    font-size: 1rem;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>
  