<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const localAudioType = localStorage.getItem('graphAudioType')
const graphAudioType = ref<string>(localAudioType ? localAudioType : 'chord')

const $emit = defineEmits(['changeGraphAudioType'])

watch(graphAudioType, () => {
  $emit('changeGraphAudioType', graphAudioType.value)
  localStorage.setItem('graphAudioType', graphAudioType.value)
})

onMounted(() => {
  $emit('changeGraphAudioType', graphAudioType.value)
  localStorage.setItem('graphAudioType', graphAudioType.value)
})
</script>

<template>
  <label for="graphAudioType">Graph Audio Type:</label>
  <select id="graphAudioType" name="graphAudioType" v-model="graphAudioType">
    <option value="off">Off</option>
    <option value="arpeggio">Arpeggio</option>
    <option value="chord">Chord</option>
  </select>
</template>

<style></style>
