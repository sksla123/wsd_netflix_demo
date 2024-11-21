<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="responsive-header">
    <div class="header-left">
      <a href="#" class="logo">
        <img src="/netflix.png" alt="넷플릭스" class="logo-image">
      </a>
      <nav class="desktop-nav">
        <a href="#">홈</a>
        <a href="#">지금 뜨는 콘텐츠</a>
        <a href="#">찾아보기</a>
        <a href="#">내가 찜한 리스트</a>
      </nav>
    </div>
    <div class="header-right">
      <div class="profile-pic" @click="toggleProfile">
        <img :src="profileIcon" alt="프로필" class="profile-icon">
      </div>
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
import profileIcon from '@/assets/profile.png'

export default {
  data() {
    return {
      showMenu: false,
      profileImage: 'path_to_profile_image.jpg' // 프로필 이미지 경로 설정 필요
      profileIcon: profileIcon
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
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.logo-image {
  height: 30px; /* 로고 이미지의 높이를 조절하세요 */
  width: auto; /* 가로 비율 자동 조정 */
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

.profile-pic {
  cursor: pointer;
  margin-left: 20px;
  width: 32px; /* 프로필 아이콘의 크기를 조절하세요 */
  height: 32px;
  overflow: hidden;
  border-radius: 50%; /* 원형 프로필 이미지를 위해 추가 */
}

.profile-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-menu {
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