<script setup lang="ts">
import GraphAudioProgramButton from './GraphAudioProgramButton.vue'
import GraphAudioSlider from './GraphAudioSlider.vue'
import GraphAudioTypeButton from './GraphAudioTypeButton.vue'
import LightDarkModeButton from './LightDarkModeButton.vue'
import MIDIInButton from './MIDIInButton.vue'
import MIDIOutButton from './MIDIOutButton.vue'
import PositionDebounceSlider from './PositionDebounceSlider.vue'
import GraphTextButtonVue from './GraphTextButton.vue'
import SwitchDagButton from './SwitchDagButton.vue'
import ToggleHighlightProgram from './ToggleHighlightProgram.vue'
import ToggleVerticalPanelButton from './ToggleVerticalPanelButton.vue'
import ToggleGraphTranspositionTextProgram from './ToggleGraphTranspositionTextProgram.vue'
import { forteApiVersion, websiteVersion } from '../constants/constants'

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
    <GraphTextButtonVue
      @changeGraphText="(d: string) => $emit('changeGraphText', d)"
    ></GraphTextButtonVue>
    <SwitchDagButton @fetchAndCreateDag="(d: string) => $emit('fetchAndCreateDag', d)">
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
    <h2 class="col-span-2-option-header">Program</h2>
    <ToggleHighlightProgram
      @changeHighlightProgram="(d: boolean) => $emit('changeHighlightProgram', d)"
    ></ToggleHighlightProgram>
    <ToggleGraphTranspositionTextProgram
      @changeTranspositionTextProgram="(d: boolean) => $emit('changeTranspositionTextProgram', d)"
    >
    </ToggleGraphTranspositionTextProgram>
    <PositionDebounceSlider
      @changePositionDebounce="(d: string) => $emit('changePositionDebounce', d)"
    ></PositionDebounceSlider>
    <h2 class="col-span-2-option-header">Midi</h2>
    <MIDIInButton
      :firstInteraction="firstInteraction"
      @changeMidiIn="(d: string) => $emit('changeMidiIn', d)"
    ></MIDIInButton>
    <MIDIOutButton
      :firstInteraction="firstInteraction"
      @changeMidiOut="(d: string) => $emit('changeMidiOut', d)"
    ></MIDIOutButton>
    <h2 class="col-span-2-option-header">Github Info</h2>
    <p>Website Github:</p>
    <a
      style="display: flex; align-items: center; text-decoration: none; color: var(--color-active)"
      href="https://github.com/NinjaNas/set-class-visualizer"
    >
      <span>NinjaNas/set-class-visualizer</span>
      <img
        class="img-github"
        src="../assets/github-mark.svg"
        alt="github"
        style="margin-left: 5px"
      />
    </a>
    <p>ForteAPI Github:</p>
    <a
      style="display: flex; align-items: center; text-decoration: none; color: var(--color-active)"
      href="https://github.com/NinjaNas/ForteAPI"
    >
      <span>NinjaNas/ForteAPI</span>
      <img
        class="img-github"
        src="../assets/github-mark.svg"
        alt="github"
        style="margin-left: 5px"
      />
    </a>
    <h2 class="col-span-2-option-header">Version Info</h2>
    <p>Website Version: {{ websiteVersion }}</p>
    <p>ForteAPI Version: {{ forteApiVersion }}</p>
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
