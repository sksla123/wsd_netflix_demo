<template>
  <div class="login-container">
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
            <button type="submit">로그인</button>
          </form>
          <p>비밀번호를 잊으셨나요? <a @click="currentView = 'resetPassword'">비밀번호 재설정</a></p>
          <p>계정이 없으신가요? <a @click="currentView = 'signup'">회원가입</a></p>
        </div>

        <!-- 비밀번호 재설정 폼 -->
        <div v-else-if="currentView === 'resetPassword'" key="resetPassword">
          <h1>비밀번호 재설정</h1>
          <div v-if="resetStep === 1">
            <input type="email" v-model="resetEmail" placeholder="이메일" required>
            <button @click="sendResetCode">인증 코드 발송</button>
          </div>
          <div v-else-if="resetStep === 2">
            <input type="text" v-model="resetCode" placeholder="4자리 인증 코드" maxlength="4" required>
            <button @click="verifyResetCode">인증 코드 확인</button>
          </div>
          <div v-else-if="resetStep === 3">
            <input type="password" v-model="newPassword" placeholder="새 비밀번호" required>
            <input type="password" v-model="confirmNewPassword" placeholder="새 비밀번호 확인" required>
            <button @click="resetPassword">비밀번호 재설정</button>
          </div>
          <p><a @click="currentView = 'login'">로그인으로 돌아가기</a></p>
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
            <button type="submit">회원가입</button>
          </form>
          <p>이미 계정이 있으신가요? <a @click="currentView = 'login'">로그인</a></p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
  console.log('회원가입:', signupEmail.value, signupPassword.value, confirmPassword.value, agreeTerms.value);
  // 여기에 실제 회원가입 로직 구현
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f3f3;
}

.login-box {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #e50914;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #f40612;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox-container input {
  margin-right: 0.5rem;
}

p {
  text-align: center;
  margin-top: 1rem;
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

  input, button {
    font-size: 0.9rem;
  }
}
</style>