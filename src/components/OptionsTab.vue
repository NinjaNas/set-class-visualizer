<script setup lang="ts">
import LightDarkModeButton from './LightDarkModeButton.vue'
import MIDIInButton from './MIDIInButton.vue'
import MIDIOutButton from './MIDIOutButton.vue'
import PrimeForteButtonVue from './PrimeForteButton.vue'
import SwitchDagButton from './SwitchDagButton.vue'
</script>

<template>
  <div class="options-container">
    <LightDarkModeButton></LightDarkModeButton>
    <PrimeForteButtonVue
      @changeGraphText="(d: string) => $emit('changeGraphText', d)"
    ></PrimeForteButtonVue>
    <SwitchDagButton
      @useLocalOrFetchAndCreateDag="(d: string) => $emit('useLocalOrFetchAndCreateDag', d)"
    >
    </SwitchDagButton>
    <MIDIInButton @changeMidiIn="(d: string) => $emit('changeMidiIn', d)"></MIDIInButton>
    <MIDIOutButton @changeMidiOut="(d: string) => $emit('changeMidiOut', d)"></MIDIOutButton>
  </div>
</template>

<style>
.options-container {
  margin: 0.2em 38em 0.2em 38em;
  border-radius: 10px;
  border: 1px solid var(--color-accent);
  display: grid;
  gap: 1em 24em;
  grid-template-columns: repeat(2, max-content);
  justify-content: center;
  padding: 2em 0 2em 0;
  white-space: nowrap;
}
</style>
