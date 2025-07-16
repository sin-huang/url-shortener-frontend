import { createRouter, createWebHistory } from 'vue-router'
import TranformUrlView from '../views/TranformUrlView.vue'
import VerifyPasswordView from '@/views/VerifyPasswordView.vue'

const routes = [
    {
        path: '/',
        name: 'HOme',
        component: TranformUrlView,
    },
    {
        path: '/verify/:shortCode',
        name: 'VerifyPassword',
        component: VerifyPasswordView,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router