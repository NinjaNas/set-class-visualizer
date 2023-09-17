<script setup lang="ts">
import { ref } from 'vue'
import PianoTab from '../components/PianoTab.vue'
import OptionsTab from '../components/OptionsTab.vue'

const props = defineProps<{
  selectedSets: string[]
}>()

const activeTab = ref<string>('piano')
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
    <PianoTab v-show="activeTab === 'piano'" :selectedSets="props.selectedSets"></PianoTab>
    <OptionsTab v-show="activeTab === 'options'"></OptionsTab>
  </div>
</template>

<style>
.tabs {
  display: grid;
  grid-template-columns: repeat(3, min-content);
  padding: 1% 0 0 1%;
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
  overflow-y: scroll;
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
  min-width: 100px;
}

ul.tabs li:hover {
  background-color: var(--color-hover);
}
</style>
