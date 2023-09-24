<script setup lang="ts">
import LightDarkModeButton from './LightDarkModeButton.vue'
import PrimeForteButtonVue from './PrimeForteButton.vue'
import SwitchDagButton from './SwitchDagButton.vue'
</script>

<template>
  <div class="options-container">
    <LightDarkModeButton></LightDarkModeButton>
    <PrimeForteButtonVue
      @changeGraphText="(d: boolean) => $emit('changeGraphText', d)"
    ></PrimeForteButtonVue>
    <SwitchDagButton
      @useLocalOrFetchAndCreateDag="(d: string) => $emit('useLocalOrFetchAndCreateDag', d)"
    >
    </SwitchDagButton>
  </div>
</template>

<style>
.options-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 2em 0 0 1.2em;
}
</style>
