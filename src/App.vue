<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import D3DagVisual from './components/D3DagVisual.vue'

onMounted(() => {
  window.addEventListener('wheel', preventCtrlZoom, { passive: false })
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
