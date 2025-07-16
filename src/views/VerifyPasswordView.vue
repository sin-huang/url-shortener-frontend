<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const password = ref('')
const errorMessage = ref('')
const route = useRoute()
const router = useRouter()
const shortCode = route.params.shortCode

const verifyPassword = async () => {
  try {
    const res = await axios.post(`http://localhost:3000/verify`, {
      shortCode,
      password: password.value,
    })
    window.location.href = res.data.originalUrl
  } catch (err) {
    errorMessage.value = '密碼錯誤，請再試一次'
  }
}
</script>

<template>
  <div class="p-8 max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">此連結受密碼保護</h2>
    <input v-model="password" type="password" class="border p-2 w-full mb-4" placeholder="請輸入密碼" />
    <button @click="verifyPassword" class="bg-blue-600 text-white px-4 py-2 rounded">驗證</button>
    <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
  </div>
</template>
