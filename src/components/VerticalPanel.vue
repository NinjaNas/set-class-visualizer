<script setup lang="ts">
import { formatSetToString, transpose, toFormattedPrimeFormArray } from '@/functions/helpers'

type DataSet = {
  number: string
  primeForm: string
  vec: string
  z: null | string
  complement: null | string
}[]

const props = defineProps<{
  selectedSets: string[]
  isVerticalPanelOpen: boolean
  transposition: number
  apiData: DataSet
}>()

const findSet = (s: string) => {
  if (props.apiData.length) {
    let foundData = props.apiData.find((e) => e.primeForm === props.selectedSets[0].split('|')[0])

    if (foundData) {
      switch (s) {
        case 'vec':
          return foundData.vec
        case 'z':
          if (foundData.z && foundData.z.endsWith('A')) {
            return foundData.z + ', ' + foundData.z.slice(0, -1) + 'B'
          }
          return foundData.z
        case 'complement':
          return foundData.complement ? foundData.complement : 'Self'
        default:
          return foundData
      }
    }
  }
}
</script>

<template>
  <transition name="fade">
    <div v-if="isVerticalPanelOpen" class="vertical-panel" @click="$emit('focusVertical')">
      <a @click="$emit('closeModal')" class="menuClose"></a>
      <div class="data">
        <h1>Current Form:</h1>
        <p class="h1-font">
          {{
            '{' +
            toFormattedPrimeFormArray(selectedSets[0]).map((n: string) =>
              transpose(n, props.transposition).replace(/10/, 'T').replace(/11/, 'E')
            ) +
            '}'
          }}
        </p>
        <h1>Prime Form:</h1>
        <p class="h1-font">{{ formatSetToString(selectedSets[0]) }}</p>
        <h1>Forte Number:</h1>
        <p class="h1-font">
          {{ formatSetToString(selectedSets[0], true) }}
        </p>
        <h1 v-show="findSet('vec')">Interval Vector:</h1>
        <p class="h1-font" v-show="findSet('vec')">
          {{ findSet('vec') }}
        </p>
        <h1 v-show="findSet('z')">Zygotic Sets:</h1>
        <p class="h1-font" v-show="findSet('z')">
          {{ findSet('z') }}
        </p>
        <h1 v-show="findSet('complement')">Complement:</h1>
        <p class="h1-font" v-show="findSet('complement')">
          {{ findSet('complement') }}
        </p>
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
  overflow-y: auto;
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

.h1-font {
  font-size: 2em;
}
</style>
