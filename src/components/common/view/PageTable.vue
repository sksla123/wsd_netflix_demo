<template>
  <div class="table-container" ref="tableContainer">
    <div class="white-container" :style="whiteContainerStyle">
      <div class="poster-container" 
           v-for="movie in displayMovies" 
           :key="movie.id" 
           :style="posterContainerStyle">
        <div class="poster-wrapper">
          <component 
            :is="isMobile ? PosterMobile : Poster" 
            :movie="movie"
            class="poster-item"
          />
        </div>
      </div>
    </div>

    <div class="pagination-controls">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-button"
      >
        이전
      </button>
      <span class="page-info">{{ currentPage }} / {{ calculatedTotalPages }}</span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === calculatedTotalPages"
        class="page-button"
      >
        다음
      </button>
    </div>
  </div>
</template>

