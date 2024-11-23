import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Popular from '../components/Popular.vue'
import Search from '../components/Search.vue'
import Wishlist from '../components/Wishlist.vue'
import Signin from '../components/Signin.vue'
import store from '../store' // Vuex store import

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin
  },
  {
    path: '/popular',
    name: 'Popular',
    component: Popular
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.isLoggedIn) {
      next({
        path: '/signin',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router