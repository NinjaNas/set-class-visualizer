<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import PianoTab from '../components/PianoTab.vue'
import OptionsTab from '../components/OptionsTab.vue'
import ComposeInput from './ComposeInput.vue'

const props = defineProps<{
  isHorizontalPanelOpen: boolean
  selectedSets: string[]
  textFieldFocused: boolean
  transposition: number
}>()

const activeTab = ref<string>('piano')
const selectedMidiIn = ref<string>('')
const selectedMidiOut = ref<string>('')
const container = ref<null | HTMLDivElement>(null)
const containerHeight = ref<null | number>(null)
const isMidiLoaded = ref<boolean>(false)
const isPlaying = ref<string>('false')
const isLooping = ref<boolean>(false)
const positionId = ref<number[]>([])
const position = ref<number>(0)
const duration = ref<number>(0)
const player = ref<null | any>(null)

const changeMidiIn = (s: string) => {
  selectedMidiIn.value = s
}

const changeMidiOut = (s: string) => {
  selectedMidiOut.value = s
}

const changeIsPlaying = (s: string) => {
  isPlaying.value = s
}

const changeIsLooping = (b: boolean) => {
  isLooping.value = b
}

const changeMidiLoaded = (b: boolean) => {
  isMidiLoaded.value = b
}

const changePlayer = (a: any) => {
  player.value = a
  position.value = player.value.positionMS()
  duration.value = player.value.durationMS()
}

const changePosition = () => {
  positionId.value.push(
    setInterval(() => {
      position.value = player.value.positionMS()
    }, 100)
  )
  duration.value = player.value.durationMS()
}

const changeStopPosition = () => {
  position.value = player.value.positionMS()
  if (positionId.value.length) {
    positionId.value.forEach((e: number) => {
      clearInterval(e)
    })
    positionId.value = []
  }
}

const jumpPosition = (n: number) => {
  player.value.jump(player.value.ms2tick(n))
  position.value = n
}

const changePositionText = (n: number) => {
  position.value = n
}

const resizeHandler = (event: MouseEvent) => {
  if (!container.value) return
  if (!containerHeight.value) {
    containerHeight.value = container.value.clientHeight
  }

  const startY = event.clientY
  const initialHeight = containerHeight.value
  const handleMouseMove = (event: MouseEvent) => {
    if (event.clientY > 10 && event.clientY < window.innerHeight - 10) {
      const deltaY = event.clientY - startY
      containerHeight.value = initialHeight - deltaY
    }
  }

  const stopResizing = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResizing)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResizing)
}

onMounted(() => {
  watch(
    () => props.isHorizontalPanelOpen,
    async (isHorizontalPanelOpen) => {
      if (isHorizontalPanelOpen) {
        await nextTick() // wait for dom update because of v-show component will not be loaded
        if (container.value) {
          containerHeight.value = container.value.clientHeight
        }
      }
    }
  )
})
</script>

<template>
  <transition name="fadeup">
    <div
      v-show="isHorizontalPanelOpen"
      class="horizontal-container"
      @click="$emit('focusHorizontal')"
      :style="{ height: containerHeight + 'px' }"
      ref="container"
    >
      <div class="horizontal-container-resize" @mousedown="resizeHandler"></div>
      <div class="overflow-y-wrapper">
        <a @click="$emit('closeModal')" class="menuCloseHorizontal"></a>
        <ul class="tabs">
          <li @click="activeTab = 'piano'" :class="{ 'active-color': activeTab === 'piano' }">
            Piano
          </li>
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
          :isPlaying="isPlaying"
          :isLooping="isLooping"
          :position="position"
          :duration="duration"
          :isMidiLoaded="isMidiLoaded"
          :activeTab="activeTab"
          @changeIsPlaying="changeIsPlaying"
          @changeIsLooping="changeIsLooping"
          @jumpPosition="jumpPosition"
          @changePositionText="changePositionText"
        ></PianoTab>
        <ComposeInput
          v-show="activeTab === 'compose'"
          :isPlaying="isPlaying"
          :isLooping="isLooping"
          :isMidiLoaded="isMidiLoaded"
          :position="position"
          :duration="duration"
          :selectedSets="selectedSets"
          :transposition="transposition"
          @changeIsPlaying="changeIsPlaying"
          @changeMidiLoaded="changeMidiLoaded"
          @changePosition="changePosition"
          @changeStopPosition="changeStopPosition"
          @changePlayer="changePlayer"
          @changeIsLooping="changeIsLooping"
          @jumpPosition="jumpPosition"
          @changePositionText="changePositionText"
        ></ComposeInput>
        <OptionsTab
          v-show="activeTab === 'options'"
          @changeGraphText="(d: string) => $emit('changeGraphText', d)"
          @changeVerticalPanelToggle="(d: boolean) => $emit('changeVerticalPanelToggle', d)"
          @useLocalOrFetchAndCreateDag="(d: string) => $emit('useLocalOrFetchAndCreateDag', d)"
          @changeGraphAudioType="(d: string) => $emit('changeGraphAudioType', d)"
          @changeGraphAudioProgram="(d: string) => $emit('changeGraphAudioProgram', d)"
          @changeGraphVel="(d: string) => $emit('changeGraphVel', d)"
          @changeMidiIn="changeMidiIn"
          @changeMidiOut="changeMidiOut"
        ></OptionsTab>
      </div>
    </div>
  </transition>
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
}

/* so the resize can clip outside of the container */
.overflow-y-wrapper {
  overflow-y: auto;
  height: 100%;
}

.horizontal-container-resize {
  content: '';
  position: absolute;
  top: -6px;
  left: 0px;
  width: 100%;
  height: 10px;
  cursor: n-resize;
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

.menuCloseHorizontal:before {
  display: flex;
  align-items: center;
  justify-content: end;
  position: absolute;
  top: 0;
  right: 0;
  content: '\00d7';
  font-size: 1.5em;
  padding-right: 0.5em;
}

@media only screen and (min-width: 1280px) {
  .tabs {
    padding: 1% 0 0 1%;
    justify-content: initial;
  }
  ul.tabs li {
    min-width: 100px;
  }
}

@media only screen and (min-width: 480px) {
  .menuCloseHorizontal:before {
    font-size: 2.5em;
  }
  .horizontal-container {
    height: 400px;
  }
}

.fadeup-enter-active,
.fadeup-leave-active {
  transition: all 0.3s ease-out;
}
.fadeup-enter-from,
.fadeup-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
