<script setup lang="ts">
import { formatSetToString } from '@/functions/helpers'

defineProps<{
  selectedSets: string[]
  isVerticalPanelOpen: boolean
}>()
</script>

<template>
  <transition name="fade">
    <div v-if="isVerticalPanelOpen" class="vertical-panel" @click="$emit('focusVertical')">
      <a @click="$emit('closeModal')" class="menuClose"></a>
      <div class="data">
        <h1>Prime Form:</h1>
        <h1>{{ formatSetToString(selectedSets[0]) }}</h1>
      </div>
    </div>
  </transition>
</template>

<style>
.vertical-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 25%;
  height: 100%;
  background: var(--color-background);
  border: 2px;
  border-style: none none none dashed;
  border-color: var(--color-text);
  overflow-y: scroll;
}

.data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1em;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.menuClose:before {
  display: flex;
  align-items: center;
  justify-content: end;
  content: '\00d7';
  font-size: 2.5em;
  padding-top: 0.5em;
  padding-right: 1em;
}
</style>
