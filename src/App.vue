<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import D3DagVisual from './components/D3DagVisual.vue'
import { forteApiVersion } from './constants/constants'

onMounted(() => {
  window.addEventListener('wheel', preventCtrlZoom, { passive: false })

  if (localStorage.getItem('forteApi') !== forteApiVersion) {
    localStorage.clear()
    localStorage.setItem('forteApi', forteApiVersion)
  }
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

<style></style>
