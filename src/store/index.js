import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexSessionStorage = new VuexPersistence({
  storage: window.sessionStorage,
  reducer: (state) => ({
    isLoggedIn: state.isLoggedIn,
    userEmail: state.userEmail,
    userAPIKey: state.userAPIKey,
    wishlist: state.wishlist
  })
})

export default createStore({
  state: {
    isLoggedIn: false,
    userEmail: '',
    showLoginSuccessToast: false,
    userAPIKey: '',
    wishlist: {}
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
    },
    SET_WISHLIST(state, { userEmail, wishlist }) {
      state.wishlist[userEmail] = wishlist;
    },
    ADD_TO_WISHLIST(state, { userEmail, movieId, genreIds }) {
      if (!state.wishlist[userEmail]) {
        state.wishlist[userEmail] = {};
      }
      state.wishlist[userEmail][movieId] = genreIds;
    },
    REMOVE_FROM_WISHLIST(state, { userEmail, movieId }) {
      if (state.wishlist[userEmail]) {
        delete state.wishlist[userEmail][movieId];
      }
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
    },
    async loadWishlist({ commit }, userEmail) {
      const wishlistStr = await localStorage.getItem('UserWishlist');
      const wishlist = JSON.parse(wishlistStr || '{}');
      commit('SET_WISHLIST', { userEmail, wishlist: wishlist[userEmail] || {} });
    },
    async addToWishlist({ commit, state }, { userEmail, movieId, genreIds }) {
      commit('ADD_TO_WISHLIST', { userEmail, movieId, genreIds });
      await localStorage.setItem('UserWishlist', JSON.stringify(state.wishlist));
    },
    async removeFromWishlist({ commit, state }, { userEmail, movieId }) {
      commit('REMOVE_FROM_WISHLIST', { userEmail, movieId });
      await localStorage.setItem('UserWishlist', JSON.stringify(state.wishlist));
    }
  },
  getters: {
    isInWishlist: (state) => (userEmail, movieId) => {
      return state.wishlist[userEmail] && state.wishlist[userEmail][movieId] !== undefined;
    }
  },
  plugins: [vuexSessionStorage.plugin]
})