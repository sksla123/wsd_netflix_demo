import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Popular from '../components/Popular.vue'
import Search from '../components/Search.vue'
import Wishlist from '../components/Wishlist.vue'
import Signin from '../components/Signin.vue'

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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router