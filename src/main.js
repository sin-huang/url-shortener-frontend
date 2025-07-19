import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
app.use(Vue3Toastify, {
    autoClose: 2000,
    closeButton: false,
    position: 'bottom-right',
    hideProgressBar: true,
    transition: 'slide',
    newestOnTop: false,
})
app.use(router)
app.mount('#app')
