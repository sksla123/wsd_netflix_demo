// src/component/test/api_test.js
import axios from 'axios';

export class URLService {
  constructor() {
    this.apiKey = this.getApiKey();
  }

  getApiKey() {
    return localStorage.getItem('api_key') || '';
  }

  setApiKey(key) {
    localStorage.setItem('api_key', key);
    this.apiKey = key;
  }

  fetchFeaturedMovie = async () => {
    if (!this.apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&language=ko-KR`);
      console.log(response.data.results[0]);
      return response.data.results[0];
    } catch (error) {
      console.error('Error fetching featured movie:', error);
      throw error;
    }
  }

  getURL4PopularMovies = (page = 1) => {
    return `https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&language=ko-KR&page=${page}`;
  }

  getURL4ReleaseMovies = (page = 2) => {
    return `https://api.themoviedb.org/3/movie/now_playing?api_key=${this.apiKey}&language=ko-KR&page=${page}`;
  }

  getURL4GenreMovies = (genre, page = 1) => {
    return `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiKey}&with_genres=${genre}&language=ko-KR&page=${page}`;
  }
}