<script setup>
import { ref } from 'vue'
import '../style.css'
import axios from 'axios'

const originalUrl = ref('')
const shortUrl = ref('')
const customUrl = ref('')
const password = ref('')
const note = ref('')
const enabled = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const errors = ref({})

// 驗證 URL 格式
const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

// 驗證邏輯
const validateForm = () => {
  const newErrors = {}

  if (!originalUrl.value || !isValidUrl(originalUrl.value)) {
    newErrors.originalUrl = '請輸入有效的網址'
  }

  if (customUrl.value) {
    if (customUrl.value && !/^[a-zA-Z0-9_-]+$/.test(customUrl.value)) {
      newErrors.shortUrl = '短網址僅能包含英文、數字、- 和 _'
    } else if (customUrl.value.length !== 6) {
      newErrors.customUrl = '短網址長度必須為 6 個字元'
    }
  }

  if (password.value) {
    if (password.value && !/^[0-9]+$/.test(password.value)) {
      newErrors.password = '密碼只能是數字'
    } else if (password.value.length !== 6) {
      newErrors.password = '密碼長度必須為 6 個字元'
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 模擬送出
const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''
  shortUrl.value = ''

  try {
    // 模擬延遲
    await new Promise((resolve) => setTimeout(resolve, 1500))

    alert('表單已送出 ')

    const res = await axios.post('http://localhost:3000/shorten', {
      originalUrl: originalUrl.value,
      customUrl: customUrl.value || null,
      password: password.value || null,
    })

    shortUrl.value = res.data.shortUrl

    originalUrl.value = ''
    customUrl.value = ''
    password.value = ''
  } catch (err) {
    if (err.response?.status === 409) {
      errorMessage.value = '這個短網址已經被使用，請換一個'
    } else {
      errorMessage.value = '送出失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-6 bg-white rounded shadow">
    <!-- Breadcrumb -->
    <div class="text-sm text-gray-500 space-x-2">
      <span>HOME</span>
      <span>&gt;</span>
      <span>短網址</span>
      <span>&gt;</span>
      <span class="text-black font-medium">新增短網址</span>
    </div>

    <!-- 表單 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 連結 -->
      <div class="md:col-span-1 text-left">
        <label for="originalUrl" class="text-gray-500 block text-xs font-medium mb-1">連結</label>
        <input id="originalUrl" v-model="originalUrl" type="text" placeholder="請輸入或貼上完整的網址"
          class="placeholder-gray-400 placeholder:text-sm text-gray-800 w-full border rounded px-3 py-2"
          :class="errors.originalUrl ? 'border-red-500' : 'border-gray-300'" />
        <p class="text-xs text-gray-600 mt-1">
          貼上的網址若包括 utm 標籤，會自動解析並使用 Google Analytics 功能
        </p>
        <p v-if="errors.originalUrl" class="text-red-500 text-xs mt-1">
          {{ errors.originalUrl }}
        </p>
      </div>

      <!-- 短網址 -->
      <div class="md:col-span-1 text-left">
        <label class="block text-gray-500 text-xs  font-medium mb-1">短網址</label>
        <div class="flex">
          <input v-model="customUrl" type="text" placeholder=""
            class="placeholder-gray-400 placeholder:text-sm text-gray-800 w-full border rounded px-3 py-2"
            :class="errors.shortUrl ? 'border-red-500' : 'border-gray-300'" />
        </div>
        <p class="text-xs text-gray-600 mt-1">可自行填寫，或是自動產生</p>
        <p v-if="errors.customUrl" class="text-red-500 text-xs mt-1">
          {{ errors.customUrl }}
        </p>
      </div>

      <!-- 密碼保護 -->
      <div class="md:col-span-1 text-left">
        <label class="block text-gray-500 text-xs font-medium mb-1">密碼保護</label>
        <div class="flex">
          <input v-model="password" :type="showPassword ? 'text' : 'password'"
            class="flex-1 border border-gray-300 rounded-l px-3 py-2 text-gray-800" />
        </div>
        <p class="text-xs text-gray-600 mt-1 text-left">若不使用密碼保護，將此欄位清空即可</p>
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">
          {{ errors.password }}
        </p>
      </div>
    </div>

    <!-- 備註說明 -->
    <div>
      <div class="flex mb-2 items-center">
        <span class="block text-sm font-medium text-gray-800 mr-2">備註說明</span>
        <button class="bg-black px-2 py-1 border border-gray-300 rounded hover:bg-gray-700 text-sm">
          取得頁面資訊
        </button>
      </div>
      <textarea v-model="note" rows="4" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
    </div>

    <!-- 是否啟用 -->
    <div class="flex items-center">
      <input id="enabled" type="checkbox" v-model="enabled" class="mr-2 w-4 h-4 text-blue-600" />
      <label for="enabled" class="text-sm font-medium text-gray-800">是否啟用</label>
    </div>

    <!-- 送出按鈕 -->
    <div class="pt-4">
      <button @click="handleSubmit" :disabled="loading"
        class="px-4 py-1.5 rounded text-white bg-black hover:bg-gray-700 disabled:opacity-50">
        {{ loading ? '送出中...' : '送出' }}
      </button>
    </div>
    <div v-if="shortUrl" class="mt-4 text-green-700 font-semibold">
      🎉 你的短網址是：
      <a :href="shortUrl" target="_blank" class="underline">
        {{ shortUrl }}
      </a>
    </div>
    <div v-if="errorMessage" class="text-red-600 mt-2">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped></style>