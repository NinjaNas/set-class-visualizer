<script setup lang="ts">
import { formatSetToString, transpose, toFormattedPrimeFormArray } from '@/functions/helpers'
import { nextTick, onMounted, ref, watch } from 'vue'

type DataSet = {
  number: string
  primeForm: string
  vec: string
  z: null | string
  complement: null | string
  inversion: null | string
}[]

const props = defineProps<{
  selectedSets: string[]
  isVerticalPanelOpen: boolean
  transposition: number
  apiData: DataSet
}>()

const containerWidth = ref<null | number>(null)
const container = ref<null | HTMLDivElement>(null)

const findSet = (s: string) => {
  if (props.apiData.length) {
    let foundData = props.apiData.find((e) => e.primeForm === props.selectedSets[0].split('|')[0])

    if (foundData) {
      switch (s) {
        case 'vec':
          return foundData.vec
        case 'z':
          // if dag is original, do not return inversion distinction
          if (
            foundData.z &&
            foundData.z.endsWith('A') &&
            localStorage.getItem('dag')?.includes('original')
          ) {
            return foundData.z.slice(0, -1)
          } else if (foundData.z && foundData.z.endsWith('A')) {
            return foundData.z + ', ' + foundData.z.slice(0, -1) + 'B'
          }

          return foundData.z
        case 'complement':
          return foundData.complement ? foundData.complement : 'Self'
        case 'inversion':
          return foundData.inversion
            ? '{' + foundData.inversion.replace(/[[\]"]/g, '') + '}'
            : 'Self'
        default:
          return foundData
      }
    }
  }
}

const resizeHandler = (event: PointerEvent) => {
  if (!container.value) return
  if (!containerWidth.value) {
    containerWidth.value = container.value.clientWidth
  }

  const startX = event.clientX
  const initialWidth = containerWidth.value
  const handleMove = (event: PointerEvent) => {
    if (event.clientX > 10 && event.clientX < window.innerWidth - 10) {
      const deltaX = event.clientX - startX
      containerWidth.value = initialWidth - deltaX
    }
  }

  const stopResizing = () => {
    document.removeEventListener('pointermove', handleMove)
    document.removeEventListener('pointerup', stopResizing)
  }

  document.addEventListener('pointermove', handleMove)
  document.addEventListener('pointerup', stopResizing)
}

onMounted(() => {
  watch(
    () => props.isVerticalPanelOpen,
    async (isVerticalPanelOpen) => {
      if (isVerticalPanelOpen) {
        await nextTick() // wait for dom update because of v-show component will not be loaded
        if (container.value) {
          containerWidth.value = container.value.clientWidth
        }
      }
    }
  )
})
</script>

<template>
  <transition name="fade">
    <div
      v-show="isVerticalPanelOpen"
      ref="container"
      class="vertical-panel"
      @click="$emit('focusVertical')"
      :style="{ width: containerWidth + 'px' }"
    >
      <div class="vertical-container-resize" @pointerdown="resizeHandler"></div>
      <div class="overflow-y-wrapper">
        <a @click="$emit('closeModal')" class="menuClose"></a>
        <div class="data">
          <h1>Transposed Form:</h1>
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
            {{ formatSetToString(selectedSets[0], 'forte') }}
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
          <h1 v-show="findSet('inversion')">Inversion:</h1>
          <p class="h1-font" v-show="findSet('inversion')">
            {{ findSet('inversion') }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style>
.vertical-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: var(--color-background);
  border: 2px;
  border-style: none none none dashed;
  border-color: var(--color-text);
  white-space: nowrap;
}

@media only screen and (min-width: 480px) {
  .vertical-panel {
    width: 580px;
  }
}

/* so the resize can clip outside of the container */
.overflow-y-wrapper {
  overflow-y: auto;
  height: 100%;
}

.vertical-container-resize {
  content: '';
  position: absolute;
  top: 0px;
  left: -6px;
  width: 10px;
  height: 100%;
  cursor: w-resize;
  touch-action: none;
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
