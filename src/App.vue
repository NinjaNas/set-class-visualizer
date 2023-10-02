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

const setGraphText = () => {
  const storedValue = localStorage.getItem('graphText')

  if (!storedValue) {
    localStorage.setItem('graphText', 'prime')
  }
}

const setGraphAudioType = () => {
  const storedValue = localStorage.getItem('graphAudioType')

  if (!storedValue) {
    localStorage.setItem('graphAudioType', 'chord')
  }
}

const setGraphAudioProgram = () => {
  const storedValue = localStorage.getItem('graphAudioProgram')

  if (!storedValue) {
    localStorage.setItem('graphAudioProgram', '0')
  }
}

const setPianoAudioProgram = () => {
  const storedValue = localStorage.getItem('pianoAudioProgram')

  if (!storedValue) {
    localStorage.setItem('pianoAudioProgram', '0')
  }
}

const setMidiChannel = () => {
  const storedValue = localStorage.getItem('midiChannel')

  if (!storedValue) {
    localStorage.setItem('midiChannel', '0')
  }
}

const setVerticalPanel = () => {
  const storedValue = localStorage.getItem('sidebar')

  if (!storedValue) {
    localStorage.setItem('sidebar', 'on')
  }
}

onMounted(() => {
  window.addEventListener('wheel', preventCtrlZoom, { passive: false })
  setTheme()
  setGraphText()
  setGraphAudioType()
  setGraphAudioProgram()
  setPianoAudioProgram()
  setMidiChannel()
  setVerticalPanel()
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
