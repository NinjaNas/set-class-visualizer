<script setup lang="ts">
import { ref, watch } from 'vue'
const lightMode = ref<boolean>(localStorage.getItem('theme') === 'light' ? true : false)

watch(lightMode, () => {
  const theme = lightMode.value ? 'light' : 'dark'
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
})
</script>

<template>
  <button class="btn" type="button" @click="lightMode = !lightMode">
    <font-awesome-icon icon="sun" v-if="lightMode" /><font-awesome-icon
      icon="moon"
      v-else
      style="color: var(--color-text)"
    />
  </button>
</template>

<style>
.btn {
  position: absolute;
  background: transparent;
  background-color: transparent;
}
</style>
