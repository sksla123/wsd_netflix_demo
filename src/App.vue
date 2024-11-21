<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="responsive-header">
    <div class="header-left">
      <a href="#" class="logo">넷플릭스</a>
      <nav class="desktop-nav">
        <a href="#">홈</a>
        <a href="#">지금 뜨는 콘텐츠</a>
        <a href="#">찾아보기</a>
        <a href="#">내가 찜한 리스트</a>
      </nav>
    </div>
    <div class="header-right">
      <div class="profile-pic" @click="toggleProfile">👤</div>
      <div class="mobile-menu" @click="toggleMenu">☰</div>
    </div>
    <div v-if="showMenu" class="mobile-nav">
      <div class="mobile-profile">
        <img :src="profileImage" alt="Profile" />
        <p>간단한 프로필 소개</p>
      </div>
      <nav>
        <a href="#">홈</a>
        <a href="#">지금 뜨는 콘텐츠</a>
        <a href="#">찾아보기</a>
        <a href="#">내가 찜한 리스트</a>
      </nav>
    </div>
  </header>
  <router-view></router-view>
</template>

<script>
export default {
  data() {
    return {
      showMenu: false,
      profileImage: 'path_to_profile_image.jpg' // 프로필 이미지 경로 설정 필요
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    toggleProfile() {
      // 프로필 클릭 시 추가 동작 구현
    }
  }
};
</script>

<style scoped>
.responsive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #141414;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  color: #e50914;
  font-size: 24px;
  text-decoration: none;
  margin-right: 20px;
}

.desktop-nav {
  display: flex;
}

.desktop-nav a {
  color: white;
  margin: 0 15px;
  text-decoration: none;
}

.header-right {
  display: flex;
  align-items: center;
}

.profile-pic, .mobile-menu {
  cursor: pointer;
  color: white;
  font-size: 20px;
  margin-left: 20px;
}

.mobile-menu {
  display: none;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  background: #141414;
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  border: 1px solid #e50914;
}

.mobile-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #212121;
  padding: 10px;
}

.mobile-profile img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.mobile-nav a {
  color: white;
  padding: 10px;
  text-decoration: none;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .mobile-nav {
    display: flex;
  }
}
</style>