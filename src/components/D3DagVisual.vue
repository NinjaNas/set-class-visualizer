<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  formatSetToString,
  toFormattedPrimeFormArray,
  toMidiNote,
  transpose
} from '@/functions/helpers'
import VerticalPanel from './VerticalPanel.vue'
import HorizontalPanel from './HorizontalPanel.vue'
import HorizontalPanelOpenButton from './HorizontalPanelOpenButton.vue'
import DagFooter from './DagFooter.vue'
import GraphPanel from './GraphPanel.vue'
import * as d3 from 'd3'
import { graphJson } from 'd3-dag'
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
Tiny(JZZ)

let synth: null | any = null

import type { MutGraphNode, MutGraphLink } from 'd3-dag'
type Link = { source: string; target: string }
type GNode = MutGraphNode<string, Link>
type GLink = MutGraphLink<string, Link>
type DagJSONObject = {
  size: { width: number; height: number }
  nodes: { x: number; y: number; data: string }[]
  links: { source: string; target: string; points: number[][]; data: Link[] }
  v: number
}
type DataSetObj = {
  number: string
  primeForm: string
  vec: string
  z: null | string
  complement: null | string
  inversion: null | string
}

type DataSet = {
  number: string
  primeForm: string
  vec: string
  z: null | string
  complement: null | string
  inversion: null | string
}[]

const NODE_RADIUS = 50
const ARROW_SIZE = (NODE_RADIUS * NODE_RADIUS) / 30.0
const ARROW_LEN = Math.sqrt((4 * ARROW_SIZE) / Math.sqrt(3))

const MIN_SCALE = 0.1
const MAX_SCALE = 30

const abortController = new AbortController()
const localData = localStorage.getItem('data')
const apiData = ref<DataSet>(JSON.parse(localData ? localData : '[]'))
const localHashData = localStorage.getItem('hashData')
const localHashVecData = localStorage.getItem('hashData')
const hashData = ref<{ [key: string]: string }>(JSON.parse(localHashData ? localHashData : '{}'))
const hashVecData = ref<{ [key: string]: string }>(
  JSON.parse(localHashVecData ? localHashVecData : '{}')
)
const jsonData = ref<null | DagJSONObject>(null)
const nodeData = ref<null | GNode[]>(null)
const svgRef = ref<null | SVGElement>(null)
const graphSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })
const zoomRef = ref<number>(0.1)
const program = ref<number>(0)
const graphVel = ref<number>(60)
const transposition = ref<number>(0)
const graphAudioOctave = ref<number>(4)
const isVerticalPanelOpen = ref<boolean>(false)
const isHighlightProgram = ref<boolean>(true)
const isTranspositionTextProgram = ref<boolean>(true)
const verticalPanelToggle = ref<boolean>(true)
const isHorizontalPanelOpen = ref<boolean>(false)
const focusPanel = ref<string>('horizontal')
const textFieldFocused = ref<boolean>(false)
const parsedProgram = ref<null | { forte: string; transposition: string; timestamp: string }[]>(
  null
)
const firstInteraction = ref<boolean>(false)
const loading = ref<boolean>(true)

const prevSelectedSets = ref<string[]>([])
const prevClickedSelectedSets = ref<string[]>([])
const selectedSets = ref<string[]>([
  '["0","1","2","3","4","5","6","7","8","9","T","E"]|12-1|CCCCC6'
])

const currNoteQueue = ref<string[]>([])
const intervalIds = ref<number[]>([])
const graphAudioType = ref<string>('chord')

const fetchData = async () => {
  try {
    const res = await fetch(
      'https://hcda8f8dtk.execute-api.us-east-1.amazonaws.com/prod/api/data/',
      { signal: abortController.signal }
    )
    if (res.ok) {
      const dataRes: DataSet = await res.json()
      localStorage.setItem('data', JSON.stringify(dataRes))
      apiData.value = dataRes

      const obj: { [key: string]: string } = {}
      dataRes.forEach((e) => (obj[e.number] = e.primeForm))
      hashData.value = obj

      const objVec: { [key: string]: string } = {}
      dataRes.forEach((e) => (objVec[e.number] = e.vec))
      hashVecData.value = objVec
    } else {
      console.log('Not 200', res)
    }
  } catch (error) {
    if ((error as Error).name == 'AbortError') {
      console.log('AbortError', error)
    }
    console.log(error)
  }
}

const fetchDagData = async (url: string) => {
  try {
    const res = await fetch(
      'https://hcda8f8dtk.execute-api.us-east-1.amazonaws.com/prod/api/data/d3/' + url,
      { signal: abortController.signal }
    )
    if (res.ok) {
      const dataRes: DagJSONObject = await res.json()
      localStorage.setItem('dag', url)
      jsonData.value = dataRes
    } else {
      console.log('Not 200', res)
    }
  } catch (error) {
    if ((error as Error).name == 'AbortError') {
      console.log('AbortError', error)
    }
    console.log(error)
  }
}

let initHighlight = () => {}

const createDag = async () => {
  if (!svgRef.value || !jsonData.value) return

  const removePrevHighlight = (currOnHoverSets: string[]) => {
    if (!currOnHoverSets.length) return

    const nodesFilter = (n: GNode) =>
      currOnHoverSets.includes(n.data) && !selectedSets.value.includes(n.data)

    const linksFilter = (l: GLink) =>
      l.source.data === currOnHoverSets[0] && l.source.data !== selectedSets.value[0]

    nodes
      .filter((n) => nodesFilter(n))
      .select('circle')
      .classed('node-select', false)

    lines.filter((l) => linksFilter(l)).classed('line-select', false)

    arrows.filter((l) => linksFilter(l)).classed('arrow-select', false)
  }

  const removeCurrHighlight = (currOnHoverSets: string[]) => {
    if (!currOnHoverSets.length) return

    const nodesFilter = (n: GNode) =>
      currOnHoverSets.includes(n.data) && !selectedSets.value.includes(n.data)

    const linksFilter = (l: GLink) =>
      l.source.data === currOnHoverSets[0] && l.source.data !== selectedSets.value[0]

    nodes
      .filter((n) => nodesFilter(n))
      .select('circle')
      .classed('node-select', false)

    lines.filter((l) => linksFilter(l)).classed('line-select', false)

    arrows.filter((l) => linksFilter(l)).classed('arrow-select', false)
  }

  const addCurrHighlight = (currOnHoverSets: string[]) => {
    if (!currOnHoverSets.length) return

    const nodesFilter = (n: GNode) => currOnHoverSets.includes(n.data)

    const linksFilter = (l: GLink) => l.source.data === currOnHoverSets[0]

    nodes
      .filter((n) => nodesFilter(n))
      .select('circle')
      .classed('node-select', true)

    lines.filter((l) => linksFilter(l)).classed('line-select', true)

    arrows.filter((l) => linksFilter(l)).classed('arrow-select', true)
  }

  const getSelectedSets = (d: GNode): string[] => {
    let sets = [d.data]
    for (const c of d.children()) {
      sets.push(c.data)
    }
    return sets
  }

  const builder = graphJson()
    .nodeDatum((data) => data as string)
    .linkDatum((data) => data as Link)
  const dag = builder(jsonData.value)
  graphSize.value.width = jsonData.value.size.width
  graphSize.value.height = jsonData.value.size.height

  nodeData.value = Array.from(dag.nodes()) // used to get the text data outside of this function

  const zoom = d3.zoom<SVGElement, unknown>().scaleExtent([MIN_SCALE, MAX_SCALE]).on('zoom', zoomed)

  const svg = d3
    .select(svgRef.value)
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)
  const mainGroup = svg.append('g')

  // add lines
  const line = d3.line().curve(d3.curveMonotoneY)
  const lines = mainGroup
    .append('g')
    .selectAll('path')
    .data(dag.links())
    .enter()
    .append('path')
    .attr('d', ({ points }) => line(points))
    .classed('line', true)

  // select nodes
  const nodes = mainGroup
    .append('g')
    .selectAll('g')
    .data(dag.nodes())
    .enter()
    .append('g')
    .attr('transform', ({ x, y }) => `translate(${x}, ${y})`)
    .on('click', (event, d) => {
      if (!synth) {
        synth = JZZ.synth.Tiny()
      }

      prevSelectedSets.value = selectedSets.value

      selectedSets.value = getSelectedSets(d)

      prevClickedSelectedSets.value = selectedSets.value

      isVerticalPanelOpen.value = true && verticalPanelToggle.value
      if (!(graphAudioType.value === 'off')) {
        playAudio()
      }

      removePrevHighlight(prevSelectedSets.value)
    })
    .on('mouseover', (event, d) => {
      addCurrHighlight(getSelectedSets(d))
    })
    .on('mouseout', (event, d) => {
      removeCurrHighlight(getSelectedSets(d))
    })

  // plot node circles
  nodes.append('circle').attr('r', NODE_RADIUS).classed('node', true)

  // add arrows
  const arrow = d3.symbol().type(d3.symbolTriangle).size(ARROW_SIZE)
  const arrows = mainGroup
    .append('g')
    .selectAll('path')
    .data(dag.links())
    .enter()
    .append('path')
    .attr('d', arrow)
    .attr('transform', ({ points }) => {
      const [[sx, sy], [ex, ey]] = points.slice(-2)
      const dx = sx - ex
      const dy = sy - ey
      // This is the angle of the last line segment
      const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90
      return `translate(${ex}, ${ey}) rotate(${angle})`
    })
    .attr('stroke-dasharray', `${ARROW_LEN},${ARROW_LEN}`)
    .classed('arrow', true)

  // add text
  nodes
    .append('text')
    .text((d) => formatSetToString(d.data))
    .classed('text', true)

  // calculate the center
  const { centerX, centerY } = calcCenter(MIN_SCALE)

  svg
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity.translate(-centerX, -centerY).scale(MIN_SCALE))

  // init highlight or reset highlight after graph type change
  initHighlight = () => {
    removePrevHighlight(prevClickedSelectedSets.value)
    removePrevHighlight(prevSelectedSets.value) // required for switching nodes using parsedProgram
    for (const d of dag.nodes()) {
      // overly complicated so highlights on original dags are also correct
      if (
        (localStorage.getItem('dag')?.includes('original') &&
          selectedSets.value[0].split('|')[1].endsWith('B') &&
          d.data ===
            hashData.value[selectedSets.value[0].split('|')[1].replace(/B/g, 'A')] +
              '|' +
              selectedSets.value[0].split('|')[1].replace(/B/g, 'A') +
              '|' +
              selectedSets.value[0].split('|')[2]) ||
        d.data === selectedSets.value[0]
      ) {
        selectedSets.value = getSelectedSets(d)
        addCurrHighlight(getSelectedSets(d))
      }
    }
  }

  initHighlight()
}

const calcCenter = (scale: number) => {
  const centerScreenX = window.innerWidth / 2
  const centerScreenY = window.innerHeight / 2
  const centerSvgX = graphSize.value.width / 2
  const centerSvgY = graphSize.value.height / 2

  return {
    centerX: centerSvgX * scale - centerScreenX,
    centerY: centerSvgY * scale - centerScreenY
  }
}

const zoomed = ({ transform }: { transform: any }) => {
  const mainGroup = d3.select(svgRef.value).select('g')
  mainGroup.attr('transform', transform)
  zoomRef.value = transform.k
}

const changeZoom = (newScale: number) => {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)

  newScale = newScale / 100
  if (!newScale || newScale < MIN_SCALE) {
    newScale = MIN_SCALE
  }
  if (newScale > MAX_SCALE) {
    newScale = MAX_SCALE
  }

  const { centerX, centerY } = calcCenter(newScale)

  const zoom = d3.zoom<SVGElement, unknown>().scaleExtent([MIN_SCALE, MAX_SCALE]).on('zoom', zoomed)
  svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(-centerX, -centerY).scale(newScale))
}

const changeTransposition = (newTranspose: number) => {
  if ((!newTranspose && newTranspose !== 0) || newTranspose < 0) {
    newTranspose = 0
  }
  if (newTranspose > 11) {
    newTranspose = 11
  }
  transposition.value = newTranspose
  if (localStorage.getItem('graphText') === 'prime') {
    changePrimeFormAndUpdateOctaveText()
  }
  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }
}

const getText = () => {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  if (!nodeData.value) return
  return svg.selectAll('text').data(nodeData.value)
}

const changePrimeFormAndUpdateOctaveText = () => {
  const nodes = getText()
  if (!nodes) return
  nodes.text((d) => {
    // cannot do math on empty set
    if (d.data.split('|')[0] === '[""]') {
      return '{}'
    }
    return (
      '{' +
      toFormattedPrimeFormArray(d.data).map((n: string) =>
        transpose(n, transposition.value).replace(/10/, 'T').replace(/11/, 'E')
      ) +
      '}'
    )
  })
}

const changeToForte = () => {
  const nodes = getText()
  if (!nodes) return
  nodes.text((d) => formatSetToString(d.data, 'forte'))
}

const changeToVec = () => {
  const nodes = getText()
  if (!nodes) return
  nodes.text((d) => formatSetToString(d.data, 'vec'))
}

const changeGraphText = (s: string) => {
  if (s === 'forte') {
    changeToForte()
  } else if (s === 'prime') {
    changePrimeFormAndUpdateOctaveText()
  } else if (s === 'vec') {
    changeToVec()
  }
}

const changeOctave = (newOctave: number) => {
  // this is 1 octave lower than the midi so the middle C (c4) on piano and midi align
  if ((!newOctave && newOctave !== 0) || newOctave < -1) {
    newOctave = -1
  }
  if (newOctave > 9) {
    newOctave = 9
  }
  graphAudioOctave.value = newOctave
  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }
}

const clearCurrentQueue = () => {
  currNoteQueue.value.forEach((midiNote) => synth.noteOff(0, midiNote))
  currNoteQueue.value = []
  intervalIds.value.forEach((id) => clearInterval(id))
}

const playAudio = () => {
  const notes: string[] = toFormattedPrimeFormArray(selectedSets.value[0])

  if (notes[0] === '') return // cannot play empty set

  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }

  synth.program(0, program.value)

  const playChord = () => {
    for (const n of notes) {
      const midiNote = toMidiNote(transpose(n, transposition.value), graphAudioOctave.value + 1)
      synth.noteOn(0, midiNote, graphVel.value)
      currNoteQueue.value.push(midiNote)
    }

    intervalIds.value.push(
      setInterval(() => {
        if (currNoteQueue.value.length) {
          clearCurrentQueue()
        }
      }, 5000)
    )
  }

  const playArpeggio = () => {
    let i = 0

    const playNextNote = () => {
      // notes will stay in the octave
      const midiNote = toMidiNote(
        transpose(notes[i], transposition.value),
        graphAudioOctave.value + 1
      )
      synth.noteOn(0, midiNote, graphVel.value)
      currNoteQueue.value.push(midiNote)
      i++
    }

    playNextNote()

    intervalIds.value.push(
      setInterval(() => {
        if (i >= notes.length) {
          intervalIds.value.push(
            setInterval(() => {
              if (currNoteQueue.value.length) {
                clearCurrentQueue()
              }
            }, 1000)
          )
        } else {
          playNextNote()
        }
      }, 1000)
    )
  }

  if (graphAudioType.value === 'chord') {
    playChord()
  } else if (graphAudioType.value === 'arpeggio') {
    playArpeggio()
  }
}

const changeGraphAudioType = (s: string) => {
  graphAudioType.value = s
  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }
}

const changeGraphAudioProgram = (s: string) => {
  program.value = parseInt(s)
  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }
}

const changeVerticalPanelToggle = (b: boolean) => {
  verticalPanelToggle.value = b
  if (isVerticalPanelOpen.value) {
    isVerticalPanelOpen.value = false
  }
}

const changeHighlightProgram = (b: boolean) => {
  isHighlightProgram.value = b
}

const changeTranspositionTextProgram = (b: boolean) => {
  isTranspositionTextProgram.value = b
}

const changeGraphVel = (s: string) => {
  graphVel.value = parseInt(s)
}

const changeParsedProgram = (d: { forte: string; transposition: string; timestamp: string }[]) => {
  parsedProgram.value = d
}

// process program
const changeSelectedSet = (s: string, t: number) => {
  prevSelectedSets.value = selectedSets.value
  selectedSets.value = [s]
  if (isTranspositionTextProgram.value) {
    changeTransposition(t)
  } else {
    transposition.value = t
  }
  if (isHighlightProgram.value) {
    initHighlight() // set highlight after selectedSet changed, can be an empty func if createDag is not run yet
  }
}

const handleFirstInteraction = () => {
  if (!firstInteraction.value) {
    firstInteraction.value = true
  }
}

const updateDimensionsHandler = () => {
  d3.select(svgRef.value).attr('width', window.innerWidth).attr('height', window.innerHeight)
}

const fetchAndCreateDag = async (dagStr: string) => {
  if (!svgRef.value) return

  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }

  await fetchDagData(dagStr)

  svgRef.value.innerHTML = '' // clear old dag if it exists
  createDag()

  const getGraphText = localStorage.getItem('graphText')
  if (getGraphText) {
    changeGraphText(getGraphText)
  }

  const getGraphAudioType = localStorage.getItem('graphAudioType')
  if (getGraphAudioType) {
    changeGraphText(getGraphAudioType)
  }

  const getGraphAudioProgram = localStorage.getItem('graphAudioProgram')
  if (getGraphAudioProgram) {
    changeGraphText(getGraphAudioProgram)
  }
}

watch(firstInteraction, () => {
  document.removeEventListener('click', handleFirstInteraction)

  synth = JZZ.synth.Tiny()
})

onMounted(async () => {
  const currDag = localStorage.getItem('dag')
  if (currDag) {
    await fetchAndCreateDag(currDag)
  } else {
    await fetchAndCreateDag('vectororiginaldag')
  }

  const data = localStorage.getItem('data')
  if (!data) {
    fetchData()
  } else {
    const obj: { [key: string]: string } = {}
    JSON.parse(data).forEach((e: DataSetObj) => (obj[e.number] = e.primeForm))
    hashData.value = obj

    const objVec: { [key: string]: string } = {}
    JSON.parse(data).forEach((e: DataSetObj) => (objVec[e.number] = e.vec))
    hashVecData.value = objVec
  }
  document.addEventListener('click', handleFirstInteraction)
  window.addEventListener('resize', updateDimensionsHandler)

  loading.value = false
})

onUnmounted(() => {
  abortController.abort()
  for (const id of intervalIds.value) {
    clearInterval(id)
  }
  window.removeEventListener('resize', updateDimensionsHandler)
  document.removeEventListener('click', handleFirstInteraction)
})
</script>

<template>
  <div v-if="loading" class="loading">Loading...</div>
  <GraphPanel
    :zoomRef="zoomRef"
    :transposition="transposition"
    :octave="graphAudioOctave"
    @changeZoom="changeZoom"
    @changeTransposition="changeTransposition"
    @changeOctave="changeOctave"
    @focusedOnText="textFieldFocused = true"
    @blurredOnText="textFieldFocused = false"
  ></GraphPanel>
  <svg ref="svgRef"></svg>
  <HorizontalPanel
    :class="{ active: focusPanel === 'horizontal' }"
    @focusHorizontal="focusPanel = 'horizontal'"
    @changeGraphText="changeGraphText"
    @fetchAndCreateDag="fetchAndCreateDag"
    @changeGraphAudioType="changeGraphAudioType"
    @changeGraphAudioProgram="changeGraphAudioProgram"
    @changeVerticalPanelToggle="changeVerticalPanelToggle"
    @changeGraphVel="changeGraphVel"
    @closeModal="isHorizontalPanelOpen = false"
    @changeParsedProgram="changeParsedProgram"
    @changeSelectedSet="changeSelectedSet"
    @changeHighlightProgram="changeHighlightProgram"
    @changeTranspositionTextProgram="changeTranspositionTextProgram"
    :isHorizontalPanelOpen="isHorizontalPanelOpen"
    :selectedSets="selectedSets"
    :textFieldFocused="textFieldFocused"
    :transposition="transposition"
    :hashData="hashData"
    :hashVecData="hashVecData"
    :parsedProgram="parsedProgram"
    :firstInteraction="firstInteraction"
  ></HorizontalPanel>
  <VerticalPanel
    :class="{ active: focusPanel === 'vertical' }"
    @focusVertical="focusPanel = 'vertical'"
    :selectedSets="selectedSets"
    :transposition="transposition"
    :isVerticalPanelOpen="isVerticalPanelOpen"
    :apiData="apiData"
    @closeModal="isVerticalPanelOpen = false"
  ></VerticalPanel>
  <HorizontalPanelOpenButton
    v-show="!isHorizontalPanelOpen"
    @openModal="isHorizontalPanelOpen = true"
  ></HorizontalPanelOpenButton>
  <DagFooter v-if="!isHorizontalPanelOpen"></DagFooter>
</template>

<style>
.loading {
  font-size: large;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

svg {
  shape-rendering: geometricPrecision;
}
</style>
