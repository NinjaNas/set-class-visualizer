<script setup lang="ts">
import { ref, watch } from 'vue'
const darkMode = ref<boolean>(localStorage.getItem('theme') === 'dark' ? true : false)

watch(darkMode, () => {
  const theme = darkMode.value ? 'dark' : 'light'
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
})
</script>

<template>
  <div class="toggle-container">
    Light Mode / Dark Mode
    <label class="switch" for="darkModeButton">
      <input
        id="darkModeButton"
        type="checkbox"
        @click="darkMode = !darkMode"
        :checked="darkMode"
      />
      <span class="slider"></span>
    </label>
  </div>
</template>

<style></style>
