<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'

const isLoggedIn = ref(false);
const userEmail = ref('user@example.com');

const handleLogin = () => {
  isLoggedIn.value = true;
  // 여기에 로그인 로직을 추가하세요
};

const handleLogout = () => {
  isLoggedIn.value = false;
  // 여기에 로그아웃 로직을 추가하세요
};
</script>

<template>
  <Header 
    :isLoggedIn="isLoggedIn" 
    :userEmail="userEmail"
    @login="handleLogin"
    @logout="handleLogout"
  />
  <main class="main-content">
    <RouterView />
  </main>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #2B2B2B;
}

.main-content {
  padding-top: 0px; /* 헤더의 높이에 맞게 조정하세요 */
}
</style>