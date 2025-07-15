<script setup>
import { ref } from 'vue'
import axios from 'axios'

const originalUrl = ref('')
const shortUrl = ref('')

const handleSubmit = async () => {
  const res = await axios.post('http://localhost:3000/shorten', {
    originalUrl: originalUrl.value
  })
  shortUrl.value = res.data.shortUrl
}
</script>

<template>
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">縮網址服務</h1>
    <input v-model="originalUrl" class="border p-2 w-full mb-4" placeholder="貼上網址" />
    <button @click="handleSubmit" class="bg-blue-500 text-white px-4 py-2 rounded">縮網址</button>
    <div v-if="shortUrl" class="mt-4">
      <p>你的短網址：</p>
      <a :href="shortUrl" target="_blank" class="text-blue-600">{{ shortUrl }}</a>
    </div>
  </div>
</template>

<style scoped>
</style>