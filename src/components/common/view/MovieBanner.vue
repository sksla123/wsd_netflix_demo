<template>
    <div class="movie-banner" :style="bannerStyle">
        <div class="overlay">
            <div class="content">
                <h1 class="title">{{ movie.title }}</h1>
                <p class="overview">{{ movie.overview }}</p>
                <div class="buttons">
                    <button class="play-button">재생</button>
                    <button class="details-button">상세 정보</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getMovieImageUrl } from '../api/url';

export default {
    name: 'MovieBanner',
    props: {
        movie: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            imageSize: 'original',
            windowWidth: window.innerWidth
        }
    },
    computed: {
        bannerStyle() {
            const backdropUrl = getMovieImageUrl(this.movie.backdropPath, this.imageSize);
            return {
                backgroundImage: `url(${backdropUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                backgroundRepeat: 'no-repeat'
            };
        }
    },
    methods: {
        handleResize() {
            this.windowWidth = window.innerWidth;
            this.updateImageSize();
        },
        updateImageSize() {
            if (this.windowWidth < 768) {
                this.imageSize = 'w780';
            } else if (this.windowWidth < 1200) {
                this.imageSize = 'w1280';
            } else {
                this.imageSize = 'original';
            }
        }
    },
    mounted() {
        this.updateImageSize();
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
}
</script>

<style scoped>
.movie-banner {
    position: relative;
    height: 70vh;
    min-height: 500px;
    color: white;
    border-radius: 20px;
    overflow: hidden;
    margin: 20px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    padding: 50px;
}

.content {
    width: 100%;
}

.title {
    font-size: calc(24px + 1vw);
    margin-bottom: 10px;
}

.overview {
    font-size: calc(14px + 0.5vw);
    margin-bottom: 20px;
}

.buttons {
    display: flex;
    gap: 10px;
}

.play-button,
.details-button {
    padding: 10px 20px;
    font-size: calc(14px + 0.2vw);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    max-width: 200px;
    /* 데스크톱 환경에서의 최대 너비 설정 */
}

.play-button {
    background-color: white;
    color: black;
}

.details-button {
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
}

.play-button:hover,
.details-button:hover {
    transform: scale(1.05);
}

@media (max-width: 768px) {
    .movie-banner {
        border-radius: 15px;
        margin: 10px;
    }

    .overlay {
        padding: 20px;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .buttons {
        flex-direction: column;
        align-items: flex-start;
        width: 30%;
        /* 모바일 환경에서의 버튼 영역 너비 */
    }

    .play-button,
    .details-button {
        width: 100%;
        padding: 8px 16px;
        font-size: calc(12px + 0.2vw);
        max-width: 130px;
        min-width: 100px;
    }
}

@media (min-width: 769px) and (max-width: 1200px) {
    .title {
        font-size: calc(28px + 1vw);
    }

    .overview {
        font-size: calc(16px + 0.5vw);
    }
}
</style>