<script setup>
import { ref, watch } from 'vue'
import '../style.css'
import { Vue3Lottie } from "vue3-lottie";
import catAnimation from "@/assets/cat.json";
import congratulationAnimation from "@/assets/congratulation.json";
import axios from 'axios'
import { DocumentDuplicateIcon, EyeIcon, EyeSlashIcon, CloudArrowDownIcon } from '@heroicons/vue/24/outline'
import { toast } from 'vue3-toastify'

const backendurl = import.meta.env.VITE_API_BASE_URL 

const originalUrl = ref('')
const shortUrl = ref('')
const customUrl = ref('')
const password = ref('')
const note = ref('')
const enabled = ref(true)
const showPassword = ref(false)
const isLoadingPageInfo = ref(false)
const loading = ref(false)
const copySuccess = ref(false)
const errorMessage = ref('')
const errors = ref({})

const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

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

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''
  shortUrl.value = ''

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const res = await axios.post(`${backendurl}/shorten`, {
      originalUrl: originalUrl.value,
      customUrl: customUrl.value || null,
      password: password.value || null,
      note: note.value || null,
    })

    shortUrl.value = res.data.shortUrl
    customUrl.value = res.data.shortUrl

    originalUrl.value = ''
    password.value = ''
    note.value = ''
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

const fetchPageNote = async () => {
  if (!customUrl.value) return

  isLoadingPageInfo.value = true
  const shortCode = customUrl.value

  try {
    const res = await axios.get(`${shortCode}/note`)
    if (res.data.note) {
      note.value = res.data.note
    } else {
      note.value = '查無備註內容'
    }
  } catch (err) {
    note.value = '無法取得備註內容'
    console.error(err)
  } finally {
    isLoadingPageInfo.value = false
  }
}

const copyToClipboard = async () => {
  if (!customUrl.value) return
  try {
    await navigator.clipboard.writeText(customUrl.value)
    copySuccess.value = true
    toast.success('短網址已複製至剪貼簿')
    setTimeout(() => (copySuccess.value = false), 2000)
  } catch (err) {
    console.error('複製失敗', err)
    toast.error('複製失敗，請稍後再試')
  }
}

watch(enabled, async (val) => {
  if (!shortUrl.value) return

  try {
    await axios.patch(`${shortUrl.value}/enabled`, {
      enabled: val,
    })
    toast.success(`短網址已${val ? '啟用' : '停用'}`)
  } catch (err) {
    toast.error('更新啟用狀態失敗')
  }
})
</script>

<template>
  <div class="relative">

    <div class="p-8 max-w-4xl mx-auto space-y-6 bg-white rounded shadow transition-all duration-300"
      :class="{ 'pointer-events-none opacity-60 blur-sm': loading }">

      <div class="text-sm text-gray-500 space-x-2">
        <span>HOME</span>
        <span>&gt;</span>
        <span>短網址</span>
        <span>&gt;</span>
        <span class="text-black font-medium">新增短網址</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

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

        <div class="md:col-span-1 text-left">
          <label class="block text-gray-500 text-xs  font-medium mb-1">短網址</label>
          <div class="relative">
            <input v-model="customUrl" type="text" placeholder=""
              class="placeholder-gray-400 placeholder:text-sm text-gray-800 w-full border rounded px-3 py-2"
              :class="errors.shortUrl ? 'border-red-500' : 'border-gray-300'" />
            <DocumentDuplicateIcon @click="copyToClipboard"
              class="w-5 h-5 text-gray-500 absolute top-1/2 -translate-y-1/2 right-2 pr-0.5 hover:text-gray-700" />
          </div>
          <p class="text-xs text-gray-600 mt-1">可自行填寫，或是自動產生</p>
          <p v-if="errors.customUrl" class="text-red-500 text-xs mt-1">
            {{ errors.customUrl }}
          </p>
        </div>

        <div class="w-full md:col-span-1 text-left">
          <label class="block text-gray-500 text-xs font-medium mb-1">密碼保護</label>

          <div class="relative w-full">
            <input v-model="password" :type="showPassword ? 'text' : 'password'"
              class="w-full pr-12 flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800" />

            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 mr-2">
              <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="w-4.5 h-4.5"></component>
            </button>
          </div>

          <p class="text-xs text-gray-600 mt-1 text-left">若不使用密碼保護，將此欄位清空即可</p>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">
            {{ errors.password }}
          </p>
        </div>
      </div>

      <div>
        <div class="flex mb-2 items-center">
          <span class="block text-sm font-medium text-gray-800 mr-2">備註說明</span>
          <div class="relative">
            <button @click="fetchPageNote" :disabled="isLoadingPageInfo"
              class="flex items-center gap-1 bg-black text-white px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-700 text-sm">
              <CloudArrowDownIcon class="w-4 h-4" />
              <span>{{ isLoadingPageInfo ? '讀取中...' : '取得頁面資訊' }}</span>
            </button>
          </div>
        </div>
        <textarea v-model="note" rows="4"
          class="text-gray-800 w-full border border-gray-300 rounded px-3 py-2"></textarea>
      </div>

      <div class="flex items-center">
        <input id="enabled" type="checkbox" v-model="enabled" class="mr-2 w-4 h-4 text-blue-600" />
        <label for="enabled" class="text-sm font-medium text-gray-800">是否啟用</label>
      </div>

      <div class="pt-4">
        <button @click="handleSubmit" :disabled="loading"
          class="px-4 py-1.5 rounded text-white bg-black hover:bg-gray-700 disabled:opacity-50">
          {{ loading ? '送出中...' : '送出' }}
        </button>
      </div>

      <Transition name="success" appear>
        <div v-if="shortUrl" class="mt-6 mx-auto max-w-2xl bg-white/70 backdrop-blur-md border border-white/30 shadow-lg rounded-xl px-6 py-4
           flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 text-sm">

          <div class="flex-shrink-0 flex justify-center sm:justify-start">
            <Vue3Lottie :animationData="congratulationAnimation" :height="50" :width="50" :loop="true"
              :autoplay="true" />
          </div>

          <div
            class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-gray-800 text-center sm:text-left w-full justify-center items-center">
            <span class="font-medium">短網址：</span>
            <div class="flex items-center space-x-2 justify-center">
              <a :href="shortUrl" target="_blank"
                class="text-green-700 font-semibold underline hover:text-green-900 transition break-all">
                {{ shortUrl }}
              </a>
              <button @click="copyToClipboard"
                class="text-green-700 hover:text-green-900 hover:bg-green-100 p-1 rounded transition">
                <DocumentDuplicateIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </Transition>
      <div v-if="errorMessage" class="text-red-600 mt-2">
        {{ errorMessage }}
      </div>
    </div>


    <Transition name="overlay">
      <div v-if="loading" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
        <div
          class="bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl border border-gray-100 animate-scale-in">

          <div class="w-40 h-40 mb-4">
            <Vue3Lottie :animationData="catAnimation" :height="160" :width="160" :loop="true" :autoplay="true" />
          </div>
          <div class="text-center">
            <p class="text-gray-800 text-lg font-semibold mb-1">處理中</p>
            <p class="text-gray-500 text-sm">正在為您建立短網址...</p>
          </div>

          <div class="w-48 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.success-enter-active {
  transition: all 0.6s ease-out;
}

.success-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@keyframes scale-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

@keyframes loading-bar {
  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(0%);
  }

  100% {
    transform: translateX(100%);
  }
}

.animate-loading-bar {
  animation: loading-bar 1.5s ease-in-out infinite;
}

.z-50 {
  z-index: 50;
}
</style>