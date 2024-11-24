import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Popular from '../components/Popular.vue'
import Search from '../components/Search.vue'
import Wishlist from '../components/Wishlist.vue'
import Signin from '../components/Signin.vue'
import Test from '../components/Test.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin,
    meta: { requiresUnauth: true }
  },
  {
    path: '/popular',
    name: 'Popular',
    component: Popular,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist,
    meta: { requiresAuth: true }
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
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
  } else if (to.matched.some(record => record.meta.requiresUnauth)) {
    if (store.state.isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router