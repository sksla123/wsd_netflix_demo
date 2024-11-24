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

// 로딩바 제어를 위한 변수 추가
let loadingBar = null

router.beforeEach((to, from, next) => {
  // 로딩바 시작
  // if (loadingBar) loadingBar.start()

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

router.afterEach(() => {
  // 로딩바 완료
  if (loadingBar) {
    loadingBar.finish()
  }
})

// 로딩바 컴포넌트 설정 함수
export function setLoadingBar(bar) {
  loadingBar = bar
}

export default router