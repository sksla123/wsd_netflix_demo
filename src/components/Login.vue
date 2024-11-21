<template>
  <div class="login-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="login">
      <img :src="profileImage" alt="Profile" />
      <h3>Welcome back</h3>
      <h2>{{ userName }}</h2>

      <form class="login-form" @submit.prevent="handleLogin">
        <input type="password" v-model="passcode" placeholder="Enter your passcode" />
        <button type="submit">LOGIN</button>
        <a :href="forgotPasscodeUrl">Forgot your passcode?</a>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import profileImageSrc from '../assets/profile.png'
import backgroundImage from '../assets/background.svg'

const profileImage = ref(profileImageSrc)
const userName = ref('Jay Bennett')
const passcode = ref('')
const forgotPasscodeUrl = ref('https://website.com')

const handleLogin = () => {
  console.log('Login attempt with passcode:', passcode.value)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.wrapper {
  height: 100%;
}

@keyframes rotate {
  100% {
    background-position: 25% 50%;
  }
}

.login-page {
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0 24px;
  background-image: v-bind('`url(${backgroundImage})`');
  background-size: cover;
  font-family: "Euclid Circular A";
  color: #000;
  animation: rotate 5s infinite alternate linear;
  min-height: 100vh;
  /* 전체 뷰포트 높이를 차지하도록 설정 */
}

@media (width >=500px) {
  body {
    padding: 0;
  }
}

.login {
  position: fixed;
  z-index: 3;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: 90%;
  padding: 70px 30px 44px;
  border-radius: 1.25rem;
  background: #ffffff;
  text-align: center;
}

@media (width >=500px) {
  .login {
    width: 70%;
  }
}

@media (width >=680px) {
  .login {
    top: 0;
    right: 0;
    left: auto;
    translate: 0 0;
    margin: 0;
    height: 100%;
    width: 50%;
    border-radius: 0;
    padding-top: 240px;
  }
}

.login>img {
  width: 160px;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 20px;
}

.login>h2 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 30px;
}

.login>h3 {
  color: rgba(0, 0, 0, 0.38);
  margin: 0 0 6px;
  font-weight: 500;
  font-size: 1rem;
}

.login-form {
  display: grid;
  gap: 20px;
  place-items: center;
  width: 100%;
  margin: 0;
}

.login-form>input,
.login-form>button {
  height: 56px;
  width: 100%;
  outline: none;
  padding: 0;
  border-radius: 10px;
  font-family: inherit;
}

.login-form>input {
  background: #eeeeee;
  border: 0;
  font-size: 18px;
  padding: 0;
  text-align: center;
}

.login-form>button {
  cursor: pointer;
  height: 56px;
  background: #685aff;
  color: #f9f9f9;
  border: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 2px;
}

.login-form>a {
  color: #685aff;
  font-size: 1rem;
  text-align: left;
  text-decoration: none;
}
</style>