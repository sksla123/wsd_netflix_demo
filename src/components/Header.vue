<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router'
import { useStore } from 'vuex';
import profileIcon from '../assets/profile.png';

const store = useStore();
const router = useRouter();

const isLoggedIn = computed(() => store.state.isLoggedIn);
const userEmail = computed(() => store.state.userEmail);

const showMenu = ref(false);
const showProfile = ref(false);
const isMobile = ref(window.innerWidth <= 768);
const isHeaderHovered = ref(false);
const mousePosition = ref({ x: 0, y: 0 });

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const toggleProfile = () => {
  showProfile.value = !showProfile.value;
};

const logout = () => {
  store.dispatch('logout');
  showProfile.value = false;
  showMenu.value = false;
};

const login = () => {
  showProfile.value = false;
  router.push('/signin');
};

const closeDropdowns = (event) => {
  if (!event.target.closest('.profile-container') && !event.target.closest('.mobile-menu')) {
    showProfile.value = false;
    showMenu.value = false;
  }
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    showMenu.value = false;
  }
};

const handleHeaderHover = (isHovered) => {
  if (!isMobile.value) {
    isHeaderHovered.value = isHovered;
  }
};

const handleMouseMove = (event) => {
  if (isHeaderHovered.value) {
    mousePosition.value = { x: event.clientX, y: event.clientY };
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdowns);
  window.addEventListener('resize', handleResize);
  document.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('mousemove', handleMouseMove);
});

watch(isMobile, (newValue) => {
  if (newValue) {
    showProfile.value = false;
    showMenu.value = false;
  }
});
</script>

<template>
  <header 
    class="responsive-header" 
    :class="{ 'header-hovered': isHeaderHovered }"
    @mouseenter="handleHeaderHover(true)"
    @mouseleave="handleHeaderHover(false)"
  >
    <div class="header-left">
      <RouterLink to="/" class="logo">
        <img src="/netflix.png" alt="넷플릭스" class="logo-image">
      </RouterLink>
      <nav class="desktop-nav">
        <RouterLink to="/">홈</RouterLink>
        <RouterLink to="/popular">지금 뜨는 콘텐츠</RouterLink>
        <RouterLink to="/search">찾아보기</RouterLink>
        <RouterLink to="/wishlist">내가 찜한 리스트</RouterLink>
      </nav>
    </div>
    <div class="header-right">
      <div class="profile-container">
        <div class="profile-pic" @click.stop="toggleProfile">
          <img :src="profileIcon" alt="프로필" class="profile-icon">
        </div>
        <div v-show="showProfile && !isMobile" class="profile-dropdown">
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
      <div class="mobile-menu" @click.stop="toggleMenu">☰</div>
    </div>
    <div v-if="isHeaderHovered" class="ripple-container">
      <div class="ripple" :style="{ left: mousePosition.x + 'px', top: mousePosition.y + 'px' }"></div>
    </div>
  </header>
  <div :class="['mobile-nav', { 'show': showMenu }]">
    <div class="mobile-profile">
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
    <nav>
      <RouterLink to="/">홈</RouterLink>
      <RouterLink to="/popular">지금 뜨는 콘텐츠</RouterLink>
      <RouterLink to="/search">찾아보기</RouterLink>
      <RouterLink to="/wishlist">내가 찜한 리스트</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.responsive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: transparent;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
  overflow: hidden;
}

.header-hovered {
  background-color: #141414;
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
  height: 30px;
  width: auto;
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

.profile-pic {
  cursor: pointer;
  margin-left: 20px;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
}

.profile-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-dropdown, .mobile-profile {
  background: #141414;
  border: 1px solid #333;
  padding: 20px;
  border-radius: 4px;
  z-index: 1001;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
}

.profile-dropdown-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.profile-dropdown p, .mobile-profile p {
  color: white;
  margin: 10px 0;
  text-align: center;
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
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-menu {
  display: none;
  cursor: pointer;
  color: white;
  font-size: 24px;
}

.mobile-nav {
  position: fixed;
  top: 55px;
  right: -10000px;
  width: 300px;
  height: calc(100vh - 60px);
  background: #141414;
  padding: 20px;
  z-index: 999;
  transition: right 0.3s ease;
  overflow-y: auto;
}

.mobile-nav.show {
  right: 0;
}

.mobile-nav a {
  color: white;
  display: block;
  padding: 10px 0;
  text-decoration: none;
}

.mobile-profile {
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 20px;
  text-align: center;
}

.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  animation: ripple-effect 1s linear infinite;
}

@keyframes ripple-effect {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  100% {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .responsive-header {
    background: #141414;
  }

  .desktop-nav {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .profile-pic {
    display: none;
  }

  .profile-dropdown {
    display: none;
  }

  .mobile-nav {
    width: 80%;
    max-width: 300px;
  }

  .login-button, .logout-button {
    width: 100px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .mobile-nav {
    width: 80%;
  }
}
</style>
