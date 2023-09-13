<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import D3DagVisual from './components/D3DagVisual.vue'

const setTheme = () => {
  const storedTheme = localStorage.getItem('theme')

  if (!storedTheme) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  } else {
    document.body.setAttribute('data-theme', storedTheme)
  }
}

onMounted(() => {
  window.addEventListener('wheel', preventCtrlZoom, { passive: false })
  setTheme()
})

onUnmounted(() => {
  window.removeEventListener('wheel', preventCtrlZoom)
})

function preventCtrlZoom(event: WheelEvent) {
  if (event.ctrlKey) {
    event.preventDefault()
  }
}
</script>

<template>
  <main>
    <D3DagVisual></D3DagVisual>
  </main>
</template>

<style scoped></style>
