import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'

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
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router