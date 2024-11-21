import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Trend from '../components/Trend.vue'
import Browse from '../components/Browse.vue'
import Mylist from '../components/Mylist.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/trend',
    name: 'Trend',
    component: Trend
  },
  {
    path: '/browse',
    name: 'Browse',
    component: Browse
  },
  {
    path: '/mylist',
    name: 'Mylist',
    component: Mylist
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router