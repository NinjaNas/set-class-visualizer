<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  formatSetToString,
  toFormattedPrimeFormArray,
  toMidiNote,
  transpose
} from '@/functions/helpers'
import VerticalPanel from './VerticalPanel.vue'
import HorizontalPanel from './HorizontalPanel.vue'
import GraphPanel from './GraphPanel.vue'
import * as d3 from 'd3'
import {
  coordSimplex,
  decrossTwoLayer,
  graphConnect,
  layeringSimplex,
  shapeEllipse,
  sugiyama,
  tweakShape,
  twolayerAgg,
  twolayerGreedy
} from 'd3-dag'
import { JZZ } from 'jzz'
import { Tiny } from 'jzz-synth-tiny'
Tiny(JZZ)
const synth = JZZ.synth.Tiny()

import type { MutGraphNode, MutGraphLink } from 'd3-dag'
type Link = { source: string; target: string }
type GNode = MutGraphNode<string, Link>
type GLink = MutGraphLink<string, Link>

const NODE_RADIUS = 50
const ARROW_SIZE = (NODE_RADIUS * NODE_RADIUS) / 30.0
const ARROW_LEN = Math.sqrt((4 * ARROW_SIZE) / Math.sqrt(3))

const MIN_SCALE = 0.1
const MAX_SCALE = 30

const abortController = new AbortController()
const links = ref<null | Link[]>(null)
const data = ref<null | GNode[]>(null)
const svgRef = ref<null | SVGElement>(null)
const graphSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })
const zoomRef = ref<number>(0.1)
const transposition = ref<number>(0)
const graphAudioOctave = ref<number>(4)
const isVerticalPanelOpen = ref<boolean>(false)
const focusPanel = ref<string>('horizontal')
const textFieldFocused = ref<boolean>(false)

const prevSelectedSets = ref<string[]>([])
const selectedSets = ref<string[]>([])

const currNoteQueue = ref<string[]>([])
const intervalIds = ref<number[]>([])

const fetchData = async () => {
  try {
    const flatRes = await fetch(
      'https://hcda8f8dtk.execute-api.us-east-1.amazonaws.com/prod/api/flatdata/primeForm/',
      { signal: abortController.signal }
    )
    if (flatRes.ok) {
      const data: string[] = await flatRes.json()
      links.value = linkBuilder(data)
      localStorage.setItem('links', JSON.stringify(links.value))
    } else {
      console.log('Not 200')
    }
  } catch (error) {
    if ((error as Error).name == 'AbortError') {
      console.log('AbortError', error)
    }
    console.log(error)
  }
}

const linkBuilder = (data: string[], condition: boolean = true) => {
  const newData: string[][] = data.map((s) => s.slice(1, -1).split(','))
  let links: Link[] = [{ source: '[""]', target: '["0"]' }]

  for (const s of newData) {
    for (const t of newData) {
      if (
        s.every((e) => t.includes(e)) &&
        s.length === t.length - 1 &&
        (condition ? t > s : true)
      ) {
        links.push({ source: '[' + s.toString() + ']', target: '[' + t.toString() + ']' })
      }
    }
  }
  return links
}

const dagBuilder = () => {
  if (!links.value || !svgRef.value) return

  const removePrevHighlight = () => {
    if (!prevSelectedSets.value.length) return

    const nodesFilter = (n: GNode) =>
      selectedSets.value.length
        ? prevSelectedSets.value.includes(n.data) && !selectedSets.value.includes(n.data)
        : prevSelectedSets.value.includes(n.data)

    const linksFilter = (l: GLink) =>
      selectedSets.value.length
        ? l.source.data === prevSelectedSets.value[0] && l.source.data !== selectedSets.value[0]
        : l.source.data === prevSelectedSets.value[0]

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
      selectedSets.value.length
        ? currOnHoverSets.includes(n.data) && !selectedSets.value.includes(n.data)
        : currOnHoverSets.includes(n.data)

    const linksFilter = (l: GLink) =>
      selectedSets.value.length
        ? l.source.data === currOnHoverSets[0] && l.source.data !== selectedSets.value[0]
        : l.source.data === currOnHoverSets[0]

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

  const builder = graphConnect()
    .sourceId(({ source }: { source: string }) => source)
    .targetId(({ target }: { target: string }) => target)
  const dag = builder(links.value)

  const zoom = d3.zoom<SVGElement, unknown>().scaleExtent([MIN_SCALE, MAX_SCALE]).on('zoom', zoomed)
  const layout = sugiyama()
    .layering(layeringSimplex())
    .decross(decrossTwoLayer().order(twolayerGreedy().base(twolayerAgg())))
    .coord(coordSimplex())
    .nodeSize([2 * NODE_RADIUS, 2 * NODE_RADIUS])
    .gap([NODE_RADIUS, NODE_RADIUS])
    .tweaks([tweakShape([2 * NODE_RADIUS, 2 * NODE_RADIUS], shapeEllipse)])
  const { width, height } = layout(dag as any)
  graphSize.value.width = width
  graphSize.value.height = height
  data.value = Array.from(dag.nodes())

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
      prevSelectedSets.value = selectedSets.value

      selectedSets.value = getSelectedSets(d)

      isVerticalPanelOpen.value = true
      playAudio()

      removePrevHighlight()
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
  updateText()
  clearCurrentQueue()
}

const updateText = () => {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  if (!data.value) return
  const nodes = svg.selectAll('text').data(data.value)
  nodes.text((d) => {
    // cannot do math on empty set
    if (d.data === '[""]') {
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

const changeOctave = (newOctave: number) => {
  // this is 1 octave lower than the midi so the middle C (c4) on piano and midi align
  if ((!newOctave && newOctave !== 0) || newOctave < -1) {
    newOctave = -1
  }
  if (newOctave > 9) {
    newOctave = 9
  }
  graphAudioOctave.value = newOctave
  clearCurrentQueue()
}

const clearCurrentQueue = () => {
  currNoteQueue.value.forEach((midiNote) => synth.noteOff(0, midiNote))
  currNoteQueue.value = []
  intervalIds.value.forEach((id) => clearInterval(id))
}

const playAudio = () => {
  if (!selectedSets.value.length) return

  const notes: string[] = toFormattedPrimeFormArray(selectedSets.value[0])

  if (notes[0] === '') return // cannot play empty set

  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }

  let i = 0

  const playNextNote = () => {
    // notes will stay in the octave
    const midiNote = toMidiNote(
      transpose(notes[i], transposition.value),
      graphAudioOctave.value + 1
    )
    synth.noteOn(0, midiNote, 60)
    currNoteQueue.value.push(midiNote)
    i++
  }

  playNextNote()

  intervalIds.value.push(
    setInterval(() => {
      if (i >= notes.length) {
        intervalIds.value.push(
          setInterval(() => {
            clearCurrentQueue()
          }, 1000)
        )
      } else {
        playNextNote()
      }
    }, 1000)
  )
}

const updateDimensionsHandler = () => {
  d3.select(svgRef.value).attr('width', window.innerWidth).attr('height', window.innerHeight)
}

onMounted(async () => {
  const getLinks = localStorage.getItem('links')
  if (getLinks) {
    links.value = JSON.parse(getLinks)
    console.log('setting links from local')
  } else {
    await fetchData()
  }
  dagBuilder()
  window.addEventListener('resize', updateDimensionsHandler)
})

onUnmounted(() => {
  abortController.abort()
  for (const id of intervalIds.value) {
    clearInterval(id)
  }
  window.removeEventListener('resize', updateDimensionsHandler)
})
</script>

<template>
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
    :selectedSets="selectedSets"
    :textFieldFocused="textFieldFocused"
    :transposition="transposition"
  ></HorizontalPanel>
  <VerticalPanel
    :class="{ active: focusPanel === 'vertical' }"
    @focusVertical="focusPanel = 'vertical'"
    :selectedSets="selectedSets"
    :isVerticalPanelOpen="isVerticalPanelOpen"
    @closeModal="isVerticalPanelOpen = false"
  ></VerticalPanel>
</template>
l
<style>
svg {
  shape-rendering: geometricPrecision;
}
</style>
