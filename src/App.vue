<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import D3DagVisual from './components/D3DagVisual.vue'
import { forteApiVersion, websiteVersion } from './constants/constants'

onMounted(() => {
  window.addEventListener('wheel', preventCtrlZoom, { passive: false })

  if (
    localStorage.getItem('forteApi') !== forteApiVersion ||
    localStorage.getItem('websiteVer') !== websiteVersion
  ) {
    localStorage.clear()
    localStorage.setItem('forteApi', forteApiVersion)
    localStorage.setItem('websiteVer', websiteVersion)
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
