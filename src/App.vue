<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import D3DagVisual from './components/D3DagVisual.vue'
import { forteApiVersion } from './constants/constants'

onMounted(() => {
  window.addEventListener('wheel', preventCtrlZoom, { passive: false })

  if (localStorage.getItem('forteApi') !== forteApiVersion) {
    localStorage.setItem('forteApi', forteApiVersion)

    localStorage.removeItem('dag')
    localStorage.setItem('dag', 'vectororiginaldag')

    localStorage.removeItem('data')

    localStorage.removeItem('hashData')
    localStorage.removeItem('strictdagprimeforte')
    localStorage.removeItem('cardinaldagprimeforte')
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
