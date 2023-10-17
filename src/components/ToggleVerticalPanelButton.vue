<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
const verticalPanel = ref<boolean>(localStorage.getItem('sidebar') === 'off' ? false : true)

const $emit = defineEmits(['changeVerticalPanelToggle'])

watch(verticalPanel, () => {
  const mode = verticalPanel.value ? 'on' : 'off'
  $emit('changeVerticalPanelToggle', verticalPanel.value)
  localStorage.setItem('sidebar', mode)
})

onMounted(() => {
  const mode = verticalPanel.value ? 'on' : 'off'
  $emit('changeVerticalPanelToggle', verticalPanel.value)
  localStorage.setItem('sidebar', mode)
})
</script>

<template>
  <label for="verticalPanelOptionButton">Toggle Sidebar:</label>
  <label class="switch">
    <input
      id="verticalPanelOptionButton"
      type="checkbox"
      @click="verticalPanel = !verticalPanel"
      :checked="verticalPanel"
    />
    <span class="slider"></span>
  </label>
</template>

<style></style>
