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
              <input type="email" v-model="loginEmail" placeholder="이메일" required>
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
              <input type="email" v-model="resetEmail" placeholder="이메일" required>
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
              <input type="email" v-model="signupEmail" placeholder="이메일" required>
              <input type="password" v-model="signupPassword" placeholder="비밀번호" required>
              <input type="password" v-model="confirmPassword" placeholder="비밀번호 확인" required>
              <div class="checkbox-container">
                <input type="checkbox" id="agreeTerms" v-model="agreeTerms">
                <label for="agreeTerms">서비스 이용약관에 동의합니다</label>
              </div>
              <button type="submit" class="login-button">회원가입</button>
            </form>
            <div v-if="signupMessages.length > 0" class="error-messages">
              <p v-for="(message, index) in signupMessages" :key="index" class="error-message">{{ message }}</p>
            </div>
            <div class="additional-options">
              <p>이미 계정이 있으신가요? <a @click="currentView = 'login'">로그인</a></p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { handleSignup as signupHandler } from '../api/join';

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
const signupMessages = ref([]);

// 로그인 처리
const handleLogin = () => {
  console.log('로그인 시도:', loginEmail.value, loginPassword.value, rememberMe.value);
  // 여기에 실제 로그인 로직 구현
};

// 비밀번호 재설정 처리
const sendResetCode = () => {
  console.log('인증 코드 발송:', resetEmail.value);
  resetStep.value = 2;
  // 여기에 실제 인증 코드 발송 로직 구현
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
    alert(result.message);
    window.location.reload();
  } else {
    signupMessages.value = result.messages;
  }
};
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
  top: -60px;
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

.error-messages {
  margin-top: 1rem;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-bottom: 5px;
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
    top: -50px;
  }
}
</style>