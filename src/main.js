import { createApp } from 'vue'
import './index.css';
import App from './App.vue'
import router from './router'
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import 'primeicons/primeicons.css'
import { faSpinner, faStar } from '@fortawesome/free-solid-svg-icons'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import Vue3TouchEvents from "vue3-touch-events";

library.add(faSpinner, faStar)

const app = createApp(App)
app.use(store)
app.use(router)
app.use(VueVirtualScroller)
app.use(Vue3TouchEvents)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')