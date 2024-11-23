import { createStore } from 'vuex'

export default createStore({
  state: {
    isLoggedIn: false,
    userEmail: ''
  },
  mutations: {
    setLoggedIn(state, value) {
      state.isLoggedIn = value
    },
    setUserEmail(state, email) {
      state.userEmail = email
    }
  },
  actions: {
    login({ commit }, email) {
      // 여기에 로그인 로직을 추가하세요
      commit('setLoggedIn', true)
      commit('setUserEmail', email)
    },
    logout({ commit }) {
      // 여기에 로그아웃 로직을 추가하세요
      commit('setLoggedIn', false)
      commit('setUserEmail', '')
    }
  }
})