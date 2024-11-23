import { createStore } from 'vuex'

export default createStore({
  state: {
    isLoggedIn: false,
    userEmail: '',
    userAPIKey: '',
    showLoginSuccessToast: false
  },
  mutations: {
    setLoggedIn(state, value) {
      state.isLoggedIn = value
    },
    setUserEmail(state, email) {
      state.userEmail = email
    },
    setShowLoginSuccessToast(state, value) {
      state.showLoginSuccessToast = value
    }
  },
  actions: {
    login({ commit }, email) {
      commit('setLoggedIn', true)
      commit('setUserEmail', email)
      commit('setShowLoginSuccessToast', true)
    },
    logout({ commit }) {
      commit('setLoggedIn', false)
      commit('setUserEmail', '')
    },
    clearLoginSuccessToast({ commit }) {
      commit('setShowLoginSuccessToast', false)
    }
  }
})