<script setup lang="ts">
import { ref, watch } from 'vue'
const forte = ref<boolean>(localStorage.getItem('graphText') === 'forte' ? true : false)

const $emit = defineEmits(['changeGraphText'])

watch(forte, () => {
  const display = forte.value ? 'forte' : 'prime'
  $emit('changeGraphText', forte.value)
  localStorage.setItem('graphText', display)
})
</script>

<template>
  <div class="toggle-container">
    Toggle Forte Number
    <label class="switch" for="graphTextButton">
      <input id="graphTextButton" type="checkbox" @click="forte = !forte" :checked="forte" />
      <span class="slider"></span>
    </label>
  </div>
</template>

<style></style>
