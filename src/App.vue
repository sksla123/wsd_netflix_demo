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
      <div class="profile-container">
        <div class="profile-pic" @click="toggleProfile">
          <img :src="profileIcon" alt="프로필" class="profile-icon">
        </div>
        <div v-show="showProfile" class="profile-dropdown">
          <template v-if="isLoggedIn">
            <img :src="profileIcon" alt="프로필" class="profile-dropdown-icon">
            <p>{{ userEmail }}</p>
            <button @click="logout" class="logout-button">로그아웃</button>
          </template>
          <template v-else>
            <p>로그인 해주세요</p>
            <button @click="login" class="login-button">로그인</button>
          </template>
        </div>
      </div>
      <div class="mobile-menu" @click="toggleMenu">☰</div>
    </div>
    <div v-show="showMenu" class="mobile-nav">
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
import { ref } from 'vue';
import profileIcon from './assets/profile.png';

export default {
  setup() {
    const showMenu = ref(false);
    const showProfile = ref(false);
    const userEmail = ref('user@example.com');
    const isLoggedIn = ref(false); // 로그인 상태를 나타내는 플래그

    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

    const toggleProfile = () => {
      showProfile.value = !showProfile.value;
    };

    const logout = () => {
      isLoggedIn.value = false;
      console.log('Logged out');
    };

    const login = () => {
      isLoggedIn.value = true;
      console.log('Logged in');
    };

    return {
      showMenu,
      showProfile,
      profileIcon,
      userEmail,
      isLoggedIn,
      toggleMenu,
      toggleProfile,
      logout,
      login
    };
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

.profile-container {
  position: relative;
}

.profile-dropdown {
  /* 기존 스타일 유지 */
  min-width: 200px; /* 드롭다운의 최소 너비 설정 */
}

.login-button, .logout-button {
  background: #e50914;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.profile-dropdown p {
  color: white;
  margin: 10px 0;
  text-align: center;
}

.logout-button {
  background: #e50914;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.profile-pic {
  cursor: pointer;
  margin-left: 20px;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
}

.profile-icon, .mobile-profile-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #212121;
  padding: 10px;
}

.mobile-profile-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.mobile-menu {
  display: none; /* 기본적으로 숨김 */
  cursor: pointer;
  color: white;
  font-size: 24px; /* 아이콘 크기 조절 */
}

.mobile-nav {
  display: none; /* 기본적으로 숨김 */
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #141414;
  padding: 20px;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu {
    display: block; /* 모바일에서 표시 */
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
  }

  .profile-pic {
    display: none;
  }
}
</style>