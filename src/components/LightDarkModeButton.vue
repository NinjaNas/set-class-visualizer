<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const darkMode = ref<boolean>(false)

const setTheme = () => {
  const storedTheme = localStorage.getItem('theme')

  if (!storedTheme) {
    console.log(window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
      return true
    } else {
      document.body.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
      return false
    }
  } else {
    document.body.setAttribute('data-theme', storedTheme)
    return storedTheme === 'dark' ? true : false
  }
}

watch(darkMode, () => {
  const theme = darkMode.value ? 'dark' : 'light'
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
})

onMounted(() => {
  darkMode.value = setTheme()
})
</script>

<template>
  <label for="darkModeButton">Toggle Dark Mode:</label>
  <label class="switch">
    <input id="darkModeButton" type="checkbox" @click="darkMode = !darkMode" :checked="darkMode" />
    <span class="slider"></span>
  </label>
</template>

<style></style>
