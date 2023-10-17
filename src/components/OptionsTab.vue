<script setup lang="ts">
import GraphAudioProgramButton from './GraphAudioProgramButton.vue'
import GraphAudioSlider from './GraphAudioSlider.vue'
import GraphAudioTypeButton from './GraphAudioTypeButton.vue'
import LightDarkModeButton from './LightDarkModeButton.vue'
import MIDIInButton from './MIDIInButton.vue'
import MIDIOutButton from './MIDIOutButton.vue'
import PrimeForteButtonVue from './PrimeForteButton.vue'
import SwitchDagButton from './SwitchDagButton.vue'
import ToggleVerticalPanelButton from './ToggleVerticalPanelButton.vue'

defineProps<{
  firstInteraction: boolean
}>()
</script>

<template>
  <div class="options-container">
    <h2 class="col-span-2-option-header">Display</h2>
    <LightDarkModeButton></LightDarkModeButton>
    <ToggleVerticalPanelButton
      @changeVerticalPanelToggle="(d: boolean) => $emit('changeVerticalPanelToggle', d)"
    ></ToggleVerticalPanelButton>
    <h2 class="col-span-2-option-header">Graph</h2>
    <PrimeForteButtonVue
      @changeGraphText="(d: string) => $emit('changeGraphText', d)"
    ></PrimeForteButtonVue>
    <SwitchDagButton
      @useLocalOrFetchAndCreateDag="(d: string) => $emit('useLocalOrFetchAndCreateDag', d)"
    >
    </SwitchDagButton>
    <GraphAudioTypeButton
      @changeGraphAudioType="(d: string) => $emit('changeGraphAudioType', d)"
    ></GraphAudioTypeButton>
    <GraphAudioProgramButton
      @changeGraphAudioProgram="(d: string) => $emit('changeGraphAudioProgram', d)"
    ></GraphAudioProgramButton>
    <GraphAudioSlider
      @changeGraphVel="(d: string) => $emit('changeGraphVel', d)"
    ></GraphAudioSlider>
    <h2 class="col-span-2-option-header">Midi</h2>
    <MIDIInButton
      :firstInteraction="firstInteraction"
      @changeMidiIn="(d: string) => $emit('changeMidiIn', d)"
    ></MIDIInButton>
    <MIDIOutButton
      :firstInteraction="firstInteraction"
      @changeMidiOut="(d: string) => $emit('changeMidiOut', d)"
    ></MIDIOutButton>
  </div>
</template>

<style>
.col-span-2-option-header {
  grid-column: span 1;
  font-weight: bold;
  text-decoration: underline;
}

.options-container {
  margin: 0.2em auto 0.2em auto;
  width: min-content;
  border-radius: 10px;
  border: 1px solid var(--color-accent);
  display: grid;
  gap: 1em 20%;
  grid-template-columns: repeat(1, 1fr);
  justify-content: center;
  align-items: center;
  padding: 2em 4em 2em 4em;
  white-space: nowrap;
}

@media only screen and (min-width: 480px) {
  .options-container {
    grid-template-columns: repeat(2, min-content);
    padding: 2em 8em 2em 8em;
  }
  .col-span-2-option-header {
    grid-column: span 2;
  }
}
</style>
