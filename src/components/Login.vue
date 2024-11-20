<template>
    <div class="login">
      <h2>Login</h2>
      <form @submit.prevent="onSubmit">
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" />
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Login',
    data() {
      return {
        username: '',
        password: ''
      }
    },
    methods: {
      onSubmit() {
        // 여기에 로그인 로직을 구현합니다
        console.log('Login attempt:', this.username, this.password)
      }
    }
  }
  </script>
  
  <style scoped>
  .login {
    max-width: 300px;
    margin: 0 auto;
  }
  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: #42b983;
    color: white;
    border: none;
    cursor: pointer;
  }
  </style>