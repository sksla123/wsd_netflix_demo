<template>
  <div class="login-container" :style="{ height: `${availableHeight}px` }">
    <div class="login-box-wrapper">
      <img src="/netflix.png" alt="Netflix" class="netflix-logo">
      <div class="login-box">
        <Transition name="rotate" mode="out-in">
          <!-- 로그인 폼 -->
          <div v-if="currentView === 'login'" key="login">
            <h1>로그인</h1>
            <form @submit.prevent="handleLogin">
              <input type="text" v-model="loginEmail" placeholder="이메일" required>
              <input type="password" v-model="loginPassword" placeholder="비밀번호" required>
              <div class="checkbox-container">
                <input type="checkbox" id="rememberMe" v-model="rememberMe">
                <label for="rememberMe">로그인 정보 저장</label>
              </div>
              <button type="submit" class="login-button">로그인</button>
            </form>
            <div class="additional-options">
              <p>비밀번호를 잊으셨나요? <a @click="currentView = 'resetPassword'">비밀번호 재설정</a></p>
              <p>계정이 없으신가요? <a @click="currentView = 'signup'">회원가입</a></p>
            </div>
          </div>

          <!-- 비밀번호 재설정 폼 -->
          <div v-else-if="currentView === 'resetPassword'" key="resetPassword">
            <h1>비밀번호 재설정</h1>
            <div v-if="resetStep === 1">
              <input type="text" v-model="resetEmail" placeholder="이메일" required>
              <button @click="sendResetCode" class="login-button">인증 코드 발송</button>
            </div>
            <div v-else-if="resetStep === 2">
              <input type="text" v-model="resetCode" placeholder="4자리 인증 코드" maxlength="4" required>
              <button @click="verifyResetCode" class="login-button">인증 코드 확인</button>
            </div>
            <div v-else-if="resetStep === 3">
              <input type="password" v-model="newPassword" placeholder="새 비밀번호" required>
              <input type="password" v-model="confirmNewPassword" placeholder="새 비밀번호 확인" required>
              <button @click="resetPassword" class="login-button">비밀번호 재설정</button>
            </div>
            <div class="additional-options">
              <p><a @click="currentView = 'login'">로그인으로 돌아가기</a></p>
            </div>
          </div>

          <!-- 회원가입 폼 -->
          <div v-else-if="currentView === 'signup'" key="signup">
            <h1>회원가입</h1>
            <form @submit.prevent="handleSignup">
              <input type="text" v-model="signupEmail" placeholder="이메일" required>
              <input type="password" v-model="signupPassword" placeholder="비밀번호" required>
              <input type="password" v-model="confirmPassword" placeholder="비밀번호 확인" required>
              <div class="checkbox-container">
                <input type="checkbox" id="agreeTerms" v-model="agreeTerms">
                <label for="agreeTerms">서비스 이용약관에 동의합니다</label>
              </div>
              <button type="submit" class="login-button">회원가입</button>
            </form>
            <div class="additional-options">
              <p>이미 계정이 있으신가요? <a @click="currentView = 'login'">로그인</a></p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
  <Toast v-if="showToast" :message="toastMessage" :type="toastType" :duration="toastDuration" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { handleSignup as signupHandler } from './signin/join';
import { handleLogin as loginHandler } from './signin/signin';
import Toast from '../components/common/view/Toast.vue';

const router = useRouter();
const store = useStore();

const props = defineProps({
  availableHeight: {
    type: Number,
    required: true
  }
});

const currentView = ref('login');
const resetStep = ref(1);

// 로그인 관련 상태
const loginEmail = ref('');
const loginPassword = ref('');
const rememberMe = ref(false);

// 비밀번호 재설정 관련 상태
const resetEmail = ref('');
const resetCode = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

// 회원가입 관련 상태
const signupEmail = ref('');
const signupPassword = ref('');
const confirmPassword = ref('');
const agreeTerms = ref(false);

// Toast 관련 상태
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('');
const toastDuration = ref(3000); // 기본 지속 시간을 3초로 설정

// 로그인 처리
const handleLogin = async () => {
  const result = await loginHandler(loginEmail.value, loginPassword.value);
  if (result.success) {
    if (rememberMe.value) {
      localStorage.setItem('LocalUserInfo', JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      }));
    }
    store.dispatch('login', loginEmail.value);
    router.push('/');
  } else {
    showToast.value = false;
    setTimeout(() => {
      showToast.value = true;
      toastMessage.value = result.message;
      toastType.value = 'error';
    }, 100);
  }
};

// 비밀번호 재설정 처리
const sendResetCode = () => {
  showToast.value = false;
  setTimeout(() => {
    showToast.value = true;
    toastMessage.value = "현 사이트는 데모 사이트로 비밀번호 초기화를 지원하지 않습니다. 비밀번호를 잊어버리신 경우 로컬 스토리지를 비우고 다시 회원가입을 진행해주시길 바랍니다.";
    toastType.value = 'warning';
    toastDuration.value = 10000; // 이 메시지의 지속 시간을 10초로 설정
  }, 100);
};

const verifyResetCode = () => {
  console.log('인증 코드 확인:', resetCode.value);
  resetStep.value = 3;
  // 여기에 실제 인증 코드 확인 로직 구현
};

const resetPassword = () => {
  console.log('비밀번호 재설정:', newPassword.value, confirmNewPassword.value);
  // 여기에 실제 비밀번호 재설정 로직 구현
  currentView.value = 'login';
};

// 회원가입 처리
const handleSignup = () => {
  const result = signupHandler(signupEmail.value, signupPassword.value, confirmPassword.value, agreeTerms.value);
  if (result.success) {
    // 즉시 로그인 페이지로 전환
    currentView.value = 'login';
    // 회원가입 폼 초기화
    signupEmail.value = '';
    signupPassword.value = '';
    confirmPassword.value = '';
    agreeTerms.value = false;
    
    // 로그인 페이지로 전환 후 토스트 메시지 표시
    setTimeout(() => {
      toastMessage.value = "회원가입에 성공했습니다.";
      toastType.value = 'success';
      showToast.value = true;
    }, 100);
  } else {
    toastMessage.value = result.message;
    toastType.value = 'error';
    showToast.value = false;
    setTimeout(() => {
      showToast.value = true;
    }, 0);
  }
};

onMounted(() => {
  const savedUserInfo = localStorage.getItem('LocalUserInfo');
  if (savedUserInfo) {
    const { email, password } = JSON.parse(savedUserInfo);
    loginEmail.value = email;
    loginPassword.value = password;
    rememberMe.value = true;
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  overflow-y: auto;
}

.login-box-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.netflix-logo {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: auto;
}

.login-box {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: left;
  margin-bottom: 1.5rem;
}

input {
  width: calc(100% - 16px);
  height: 40px;
  padding: 0 8px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 40px;
  background-color: #e50914;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.login-button:hover {
  background-color: #f40612;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox-container input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-top: 1rem;
  margin-right: 0.5rem;
}

.checkbox-container label {
  font-size: 14px;
}

.additional-options {
  margin-top: 1rem;
}

.additional-options p {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

a {
  color: #0071eb;
  cursor: pointer;
}

/* 회전 애니메이션 */
.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.5s;
}

.rotate-enter-from,
.rotate-leave-to {
  opacity: 0;
  transform: rotateY(180deg);
}

.rotate-enter-to,
.rotate-leave-from {
  opacity: 1;
  transform: rotateY(0deg);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .login-box {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  input, .login-button {
    font-size: 14px;
  }

  .netflix-logo {
    width: 120px;
    top: -60px;
  }
}
</style>