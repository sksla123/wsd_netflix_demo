<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { RouterView, useRouter } from 'vue-router'
import Header from './components/Header.vue'

const store = useStore();
const router = useRouter();
const isLoggedIn = computed(() => store.state.isLoggedIn);
const userEmail = computed(() => store.state.userEmail);
const headerHeight = ref(0); 
const availableHeight = ref(0);

const handleLogin = (email) => {
  store.dispatch('login', email);
};

const handleLogout = () => {
  store.dispatch('logout');
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

// 로그인 상태 감시
watch(isLoggedIn, (newValue) => {
  if (!newValue && router.currentRoute.value.path !== '/signin') {
    router.push('/signin');
  }
}, { immediate: true });
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