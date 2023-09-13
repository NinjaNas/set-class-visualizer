<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { formatSetToString, toFormattedPrimeFormArray, toMidiNote } from '@/functions/helpers'
import VerticalPanel from './VerticalPanel.vue'
import LightDarkModeButton from './LightDarkModeButton.vue'
import HorizontalPanel from './HorizontalPanel.vue'
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

const abortController = new AbortController()
const links = ref<null | Link[]>(null)
const svgRef = ref<null | SVGElement>(null)
const isVerticalPanelOpen = ref<boolean>(false)
const focusPanel = ref<string>('horizontal')

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

const linkBuilder = (data: string[]) => {
  const newData: string[][] = data.map((s) => s.slice(1, -1).split(','))
  let links: Link[] = [{ source: '[""]', target: '["0"]' }]

  for (const s of newData) {
    for (const t of newData) {
      if (s.every((e) => t.includes(e)) && s.length === t.length - 1) {
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

  const zoom = d3.zoom<SVGElement, unknown>().scaleExtent([0.15, 32]).on('zoom', zoomed)
  const layout = sugiyama()
    .layering(layeringSimplex())
    .decross(decrossTwoLayer().order(twolayerGreedy().base(twolayerAgg())))
    .coord(coordSimplex())
    .nodeSize([2 * NODE_RADIUS, 2 * NODE_RADIUS])
    .gap([NODE_RADIUS, NODE_RADIUS])
    .tweaks([tweakShape([2 * NODE_RADIUS, 2 * NODE_RADIUS], shapeEllipse)])
  layout(dag as any)

  const svg = d3
    .select(svgRef.value)
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)
  const mainGroup = svg.append('g')
  // const defs = svg.append('defs')
  // // Initialize color map
  // const steps = dag.nnodes()
  // const interp = d3.interpolateRainbow
  // const colorMap: { [key: string]: string } = {}
  // for (const [i, node] of [...dag.nodes()].entries()) {
  //   colorMap[node.data] = interp(i / steps)
  // }

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
  // .attr('stroke', ({ source, target }) => {
  //   // encodeURIComponents for spaces, hope id doesn't have a `--` in it
  //   const gradId = encodeURIComponent(`${source.data}--${target.data}`).replace(/[^\w-]/g, '_')
  //   const grad = defs
  //     .append('linearGradient')
  //     .attr('id', gradId)
  //     .attr('gradientUnits', 'userSpaceOnUse')
  //     .attr('x1', source.x)
  //     .attr('x2', target.x)
  //     .attr('y1', source.y)
  //     .attr('y2', target.y)
  //   grad.append('stop').attr('offset', '0%').attr('stop-color', colorMap[source.data])
  //   grad.append('stop').attr('offset', '100%').attr('stop-color', colorMap[target.data])
  //   return `url(#${gradId})`
  // })

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
  // .attr('fill', (n) => colorMap[n.data])

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
    // .attr('fill', ({ target }) => colorMap[target.data])
    .attr('stroke-dasharray', `${ARROW_LEN},${ARROW_LEN}`)
    .classed('arrow', true)

  // add text
  nodes
    .append('text')
    .text((d) => formatSetToString(d.data))
    .classed('text', true)

  svg.call(zoom).call(zoom.transform, d3.zoomIdentity)

  function zoomed({ transform }: { transform: any }) {
    mainGroup.attr('transform', transform)
  }
}

const playAudio = () => {
  if (!selectedSets.value.length) return

  const notes: string[] = toFormattedPrimeFormArray(selectedSets.value[0])

  const clearCurrentQueue = () => {
    currNoteQueue.value.forEach((midiNote) => synth.noteOff(0, midiNote))
    currNoteQueue.value = []
    intervalIds.value.forEach((id) => clearInterval(id))
  }

  if (currNoteQueue.value.length) {
    clearCurrentQueue()
  }

  let i = 0

  const playNextNote = () => {
    const midiNote = toMidiNote(notes[i])
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

const updateDimensions = () => {
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
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  abortController.abort()
  for (const id of intervalIds.value) {
    clearInterval(id)
  }
  window.removeEventListener('resize', updateDimensions)
})
</script>

<template>
  <LightDarkModeButton></LightDarkModeButton>
  <svg ref="svgRef"></svg>
  <HorizontalPanel
    :class="{ active: focusPanel === 'horizontal' }"
    @focusHorizontal="focusPanel = 'horizontal'"
    :selectedSets="selectedSets"
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
