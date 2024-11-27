import { createApp } from 'vue'
import App from './App.vue'
import './index.css';

import router from './router'
import store from './store'

import 'primeicons/primeicons.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas, faSpinner, faStar } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import Vue3TouchEvents from "vue3-touch-events";

library.add(fas, far, fab, faSpinner, faStar)

const app = createApp(App)
app.use(store)
app.use(router)
app.use(VueVirtualScroller)
app.use(Vue3TouchEvents)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')