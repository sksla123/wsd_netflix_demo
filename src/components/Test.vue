<!-- src/component/test.vue -->
<template>
    <div>
        <h1>API 테스트</h1>
        <div class="api-key-container">
            <input v-model="inputApiKey" placeholder="API 키를 입력하세요" />
            <button @click="saveApiKey">API 키 저장</button>
            <button @click="deleteApiKey">API 키 삭제</button>
        </div>
        <button @click="testFeaturedMovie">인기 영화 가져오기</button>
        <button @click="testPopularMovies">인기 영화 URL 테스트</button>
        <button @click="testReleaseMovies">최신 개봉 영화 URL 테스트</button>
        <button @click="testGenreMovies">장르별 영화 URL 테스트</button>

        <div v-if="result" class="result-container">
            <h2>결과:</h2>
            <pre ref="resultPre" class="result-text">{{ result }}</pre>
            <button @click="copyResult">결과 복사</button>
        </div>
    </div>
</template>

<script>
import { URLService } from './test/api_test.js';

export default {
    data() {
        return {
            urlService: new URLService(),
            result: null,
            inputApiKey: ''
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
        async testFeaturedMovie() {
            try {
                const movie = await this.urlService.fetchFeaturedMovie();
                this.result = JSON.stringify(movie, null, 2);
            } catch (error) {
                this.result = `오류: ${error.message}`;
            }
        },
        testPopularMovies() {
            const url = this.urlService.getURL4PopularMovies();
            this.result = url;
        },
        testReleaseMovies() {
            const url = this.urlService.getURL4ReleaseMovies();
            this.result = url;
        },
        testGenreMovies() {
            const url = this.urlService.getURL4GenreMovies('28'); // 액션 장르 코드
            this.result = url;
        },
        copyResult() {
            const resultText = this.$refs.resultPre.innerText;
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(resultText).then(() => {
                    alert('결과가 클립보드에 복사되었습니다.');
                }).catch(err => {
                    console.error('복사 중 오류 발생:', err);
                    this.fallbackCopyTextToClipboard(resultText);
                });
            } else {
                this.fallbackCopyTextToClipboard(resultText);
            }
        },
        fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert('결과가 클립보드에 복사되었습니다.');
            } catch (err) {
                console.error('복사 중 오류 발생:', err);
                alert('복사에 실패했습니다. 수동으로 복사해주세요.');
            }
            document.body.removeChild(textArea);
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
</style>