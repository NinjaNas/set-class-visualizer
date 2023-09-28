<script setup lang="ts">
import { ref } from 'vue'
import PianoTab from '../components/PianoTab.vue'
import OptionsTab from '../components/OptionsTab.vue'

const props = defineProps<{
  selectedSets: string[]
  textFieldFocused: boolean
  transposition: number
}>()

const activeTab = ref<string>('piano')
const selectedMidiIn = ref<string>('')
const selectedMidiOut = ref<string>('')

const changeMidiIn = (s: string) => {
  selectedMidiIn.value = s
}

const changeMidiOut = (s: string) => {
  selectedMidiOut.value = s
}
</script>

<template>
  <div class="horizontal-container" @click="$emit('focusHorizontal')">
    <ul class="tabs">
      <li @click="activeTab = 'piano'" :class="{ 'active-color': activeTab === 'piano' }">Piano</li>
      <li @click="activeTab = 'compose'" :class="{ 'active-color': activeTab === 'compose' }">
        Compose
      </li>
      <li @click="activeTab = 'options'" :class="{ 'active-color': activeTab === 'options' }">
        Options
      </li>
    </ul>
    <PianoTab
      v-show="activeTab === 'piano'"
      :selectedSets="props.selectedSets"
      :textFieldFocused="textFieldFocused"
      :transposition="transposition"
      :selectedMidiIn="selectedMidiIn"
      :selectedMidiOut="selectedMidiOut"
    ></PianoTab>
    <OptionsTab
      v-show="activeTab === 'options'"
      @changeGraphText="(d: string) => $emit('changeGraphText', d)"
      @useLocalOrFetchAndCreateDag="(d: string) => $emit('useLocalOrFetchAndCreateDag', d)"
      @changeMidiIn="changeMidiIn"
      @changeMidiOut="changeMidiOut"
    ></OptionsTab>
  </div>
</template>

<style>
.tabs {
  display: grid;
  grid-template-columns: repeat(3, min-content);
  justify-content: center;
  padding: 1% 0 0 0;
  gap: 1%;
}

.horizontal-container {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 30%;
  background: var(--color-background);
  color: var(--color-text);
  border: 2px;
  border-style: dashed none none none;
  border-color: var(--color-text);
  overflow-y: auto;
}

span.inner {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
}

ul.tabs li {
  list-style: none;
  cursor: pointer;
  text-align: center;
  border: 1px;
  border-style: solid;
  border-radius: 5px;
  padding: 8% 2% 8% 2%;
  min-width: 79.5px;
}

ul.tabs li:hover {
  background-color: var(--color-hover);
}

@media only screen and (min-width: 480px) {
  .tabs {
    padding: 1% 0 0 1%;
    justify-content: initial;
  }
  ul.tabs li {
    min-width: 100px;
  }
}
</style>
