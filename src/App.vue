<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { RouterView, useRouter } from 'vue-router'
import Header from './components/Header.vue'
import Toast from './components/common/view/Toast.vue'
import LoadingBar from './components/LoadingBar.vue';

const store = useStore();
const router = useRouter();
const isLoggedIn = computed(() => store.state.isLoggedIn);
const userEmail = computed(() => store.state.userEmail);
const showLoginSuccessToast = computed(() => store.state.showLoginSuccessToast);
const headerHeight = ref(0);
const availableHeight = ref(0);
const availableWidth = ref(0);  // 새로 추가된 부분

const handleLogin = (email, apiKey) => {
  store.dispatch('login', { email, apiKey });
};

const handleLogout = () => {
  store.dispatch('logout');
};

const updateAvailableDimensions = () => {
  const header = document.querySelector('header');
  if (header) {
    headerHeight.value = header.offsetHeight;
    availableHeight.value = window.innerHeight - headerHeight.value;
    availableWidth.value = window.innerWidth;  // 새로 추가된 부분
  }
};

onMounted(() => {
  updateAvailableDimensions();
  window.addEventListener('resize', updateAvailableDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateAvailableDimensions);
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
  <Header :isLoggedIn="isLoggedIn" :userEmail="userEmail" @login="handleLogin" @logout="handleLogout" />
  <loading-bar /> 
  <transition name="fade" mode="out-in">
    <main class="main-content" :style="{ height: `${availableHeight}px` }">
      <RouterView :availableHeight="availableHeight" :availableWidth="availableWidth" />
    </main>
  </transition>
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}