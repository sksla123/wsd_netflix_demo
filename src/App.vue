<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { RouterView, useRouter } from 'vue-router'
import Header from './components/Header.vue'
import Toast from './components/common/view/Toast.vue'

const store = useStore();
const router = useRouter();
const isLoggedIn = computed(() => store.state.isLoggedIn);
const userEmail = computed(() => store.state.userEmail);
const showLoginSuccessToast = computed(() => store.state.showLoginSuccessToast);
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

// 로그인 성공 토스트 메시지 표시
watch(showLoginSuccessToast, (newValue) => {
  if (newValue) {
    // 토스트 메시지 표시 로직
    // 예: Toast 컴포넌트 표시
    setTimeout(() => {
      store.dispatch('clearLoginSuccessToast');
    }, 3000); // 3초 후 토스트 메시지 상태 초기화
  }
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
  <Toast v-if="showLoginSuccessToast" message="로그인에 성공했습니다." type="success" />
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