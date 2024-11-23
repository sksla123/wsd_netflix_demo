import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexSessionStorage = new VuexPersistence({
  storage: window.sessionStorage,
  reducer: (state) => ({
    isLoggedIn: state.isLoggedIn,
    userEmail: state.userEmail,
    userAPIKey: state.userAPIKey
  })
})

export default createStore({
  state: {
    isLoggedIn: false,
    userEmail: '',
    showLoginSuccessToast: false,
    userAPIKey: ''
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
    },
    setUserAPIKey(state, apiKey) {
      state.userAPIKey = apiKey
    }
  },
  actions: {
    login({ commit }, { email, apiKey }) {
      commit('setLoggedIn', true)
      commit('setUserEmail', email)
      commit('setUserAPIKey', apiKey)
      commit('setShowLoginSuccessToast', true)
    },
    logout({ commit }) {
      commit('setLoggedIn', false)
      commit('setUserEmail', '')
      commit('setUserAPIKey', '')
    },
    clearLoginSuccessToast({ commit }) {
      commit('setShowLoginSuccessToast', false)
    }
  },
  plugins: [vuexSessionStorage.plugin]
})
