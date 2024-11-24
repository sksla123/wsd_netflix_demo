<template>
    <div class="poster-container" @mouseover="isHovered = true" @mouseleave="isHovered = false">
        <div class="poster" :class="{ 'hovered': isHovered }" @click="toggleWishlist">
            <div class="poster-content">
                <div class="loading-overlay" v-if="!imageLoaded">
                    <font-awesome-icon :icon="['fas', 'spinner']" spin class="spinner" />
                </div>
                <img :src="posterUrl" @load="imageLoaded = true" @error="handleImageError" alt="Movie Poster"
                    :class="{ 'loaded': imageLoaded }">
            </div>
            <div class="wishlist-star" @click.stop="toggleWishlist">
                <font-awesome-icon :icon="['fas', 'star']" :class="{ 'wishlist': isInWishlistState }" />
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

const { id, title, posterPath, genreIds } = props.movie;
const posterUrl = computed(() => {
    if (posterPath) {
        return getMovieImageUrl(posterPath, 'w500');
    }
    return '/path/to/placeholder-image.jpg';
});
const imageLoaded = ref(false);
const isHovered = ref(false);
const isInWishlistState = ref(false);

const checkWishlist = async () => {
    try {
        const wishlistStr = await localStorage.getItem('UserWishlist');
        const wishlist = JSON.parse(wishlistStr || '{}');
        isInWishlistState.value = wishlist[userEmail.value]?.[id] !== undefined;
    } catch (error) {
        console.error("Error checking wishlist:", error);
        isInWishlistState.value = false;
    }
};

const toggleWishlist = async () => {
    try {
        const wishlistStr = await localStorage.getItem('UserWishlist');
        const wishlist = JSON.parse(wishlistStr || '{}');

        if (!wishlist[userEmail.value]) {
            wishlist[userEmail.value] = {};
        }

        if (isInWishlistState.value) {
            delete wishlist[userEmail.value][id];
        } else {
            wishlist[userEmail.value][id] = genreIds;
        }

        await localStorage.setItem('UserWishlist', JSON.stringify(wishlist));
        await checkWishlist();
    } catch (error) {
        console.error("Error toggling wishlist:", error);
    }
};

const handleImageError = () => {
    posterUrl.value = '/path/to/placeholder-image.jpg';
    imageLoaded.value = true;
};

onMounted(async () => {
    await checkWishlist();
});
</script>

<style scoped>
.poster-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px;
    margin: 10px;
    transition: all 0.3s ease;
}

.poster {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    width: 100%;
    height: 300px;
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
    font-size: 2rem;
    color: #ffffff;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
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

.poster.hovered {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.poster-container:hover .movie-title {
    transform: translateY(5px);
}

.wishlist-star {
    position: absolute;
    top: 10px;
    left: 10px;
    cursor: pointer;
    z-index: 10;
    width: 10%;
    height: 0;
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

.wishlist-star:hover .fa-star {
    color: #FFD700;
}

.movie-title {
    margin-top: 10px;
    text-align: center;
    font-size: 1rem;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease;
}
</style>