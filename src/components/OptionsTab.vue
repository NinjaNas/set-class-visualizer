<script setup lang="ts">
import LightDarkModeButton from './LightDarkModeButton.vue'
import PrimeForteButtonVue from './PrimeForteButton.vue'
</script>

<template>
  <div>
    <LightDarkModeButton></LightDarkModeButton>
    <PrimeForteButtonVue
      @changeGraphText="(d: boolean) => $emit('changeGraphText', d)"
    ></PrimeForteButtonVue>
  </div>
</template>

<style>
.toggle-container {
  display: flex;
  gap: 10px;
  padding: 1%;
}
</style>
