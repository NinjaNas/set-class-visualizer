<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const localText = localStorage.getItem('graphText')
const graphText = ref<string>(localText ? localText : 'prime')

const $emit = defineEmits(['changeGraphText'])

watch(graphText, () => {
  $emit('changeGraphText', graphText.value)
  localStorage.setItem('graphText', graphText.value)
})

onMounted(() => {
  $emit('changeGraphText', graphText.value)
  localStorage.setItem('graphText', graphText.value)
})
</script>

<template>
  <label for="graphTextButton">Graph Text:</label>
  <select id="graphTextButton" name="graphTextButton" v-model="graphText">
    <option value="prime">Prime Form</option>
    <option value="forte">Forte Number</option>
  </select>
</template>

<style></style>
