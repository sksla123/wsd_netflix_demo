<template>
    <div>
        <h1>API 테스트</h1>
        <div class="api-key-container">
            <input v-model="inputApiKey" placeholder="API 키를 입력하세요" />
            <button @click="saveApiKey">API 키 저장</button>
            <button @click="deleteApiKey">API 키 삭제</button>
        </div>
        <button @click="testPopularMovies">인기 영화 가져오기</button>
        <button @click="testReleaseMovies">최신 개봉 영화 가져오기</button>
        <button @click="testGenreMovies">장르별 영화 가져오기</button>
        <div v-if="result" class="result-container">
            <h2>결과:</h2>
            <pre ref="resultPre" class="result-text">{{ result }}</pre>
            <button @click="copyResult">결과 복사</button>
        </div>
        <HorizontalSlide v-if="movies.length > 0" :movies="movies" />
    </div>
</template>

<script>
import { URLService } from './test/api_test.js';
import { getMovieDatas, processMovieData } from './common/api/api.js';
import HorizontalSlide from './common/view/HorizontalSlide.vue';

export default {
    components: {
        HorizontalSlide
    },
    data() {
        return {
            urlService: new URLService(),
            result: null,
            inputApiKey: '',
            movies: []
        };
    },
    mounted() {
        this.inputApiKey = this.urlService.getApiKey();
    },
    methods: {
        saveApiKey() {
            this.urlService.setApiKey(this.inputApiKey);
            alert('API 키가 저장되었습니다.');
        },
        deleteApiKey() {
            this.urlService.setApiKey('');
            this.inputApiKey = '';
            alert('API 키가 삭제되었습니다.');
        },
        async fetchMovies(url) {
            try {
                const movies = await getMovieDatas(url);
                this.movies = movies;
                this.result = JSON.stringify(movies, null, 2);
            } catch (error) {
                this.result = `오류: ${error.message}`;
                this.movies = [];
            }
        },
        async testPopularMovies() {
            const url = this.urlService.getURL4PopularMovies();
            await this.fetchMovies(url);
        },
        async testReleaseMovies() {
            const url = this.urlService.getURL4ReleaseMovies();
            await this.fetchMovies(url);
        },
        async testGenreMovies() {
            const url = this.urlService.getURL4GenreMovies('28'); // 액션 장르 코드
            await this.fetchMovies(url);
        },
        copyResult() {
            // 기존 copyResult 메서드 내용
        },
        fallbackCopyTextToClipboard(text) {
            // 기존 fallbackCopyTextToClipboard 메서드 내용
        }
    }
};
</script>


<style scoped>
.api-key-container {
    margin-bottom: 15px;
}

input {
    width: 300px;
    padding: 5px;
    margin-right: 5px;
}

button {
    margin: 5px;
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

.result-container {
    margin-top: 20px;
}

.result-text {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 5px;
    color: #333;
    white-space: pre-wrap;
    word-wrap: break-word;
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    cursor: text;
}

pre {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 5px;
    color: #333;
    white-space: pre-wrap;
    word-wrap: break-word;
    user-select: text;
}

h1,
h2,
div:not(.api-key-container) {
    color: white;
}

.posters-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    margin-top: 20px;
}
</style>