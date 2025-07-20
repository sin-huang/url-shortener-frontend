import { createRouter, createWebHistory } from 'vue-router'
import TranformUrlView from '../views/TranformUrlView.vue'
import VerifyPasswordView from '@/views/VerifyPasswordView.vue'
import UrlDisabledView from '../views/UrlDisabledView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: TranformUrlView,
    },
    {
        path: '/verify/:shortCode',
        name: 'VerifyPassword',
        component: VerifyPasswordView,
    },
    {
        path: '/disabled',
        name: 'UrlDisabled',
        component: UrlDisabledView,
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router