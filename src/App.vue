<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'

const isLoggedIn = ref(false);
const userEmail = ref('user@example.com');
const headerHeight = ref(0); 
const availableHeight = ref(0);

const handleLogin = () => {
  isLoggedIn.value = true;
  // 여기에 로그인 로직을 추가하세요
};

const handleLogout = () => {
  isLoggedIn.value = false;
  // 여기에 로그아웃 로직을 추가하세요
};

const updateAvailableHeight = () => {
  const header = document.querySelector('header');
  if (header) {
    headerHeight.value = header.offsetHeight;
    availableHeight.value = window.innerHeight - headerHeight.value;
  }
};

onMounted(() => {
  updateAvailableHeight();
  window.addEventListener('resize', updateAvailableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateAvailableHeight);
});
</script>

<template>
  <Header 
    :isLoggedIn="isLoggedIn" 
    :userEmail="userEmail"
    @login="handleLogin"
    @logout="handleLogout"
  />
  <main class="main-content" :style="{ height: `${availableHeight}px` }">
    <RouterView :availableHeight="availableHeight" />
  </main>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #2B2B2B;
}

.main-content {
  overflow-y: auto;
}
</style>