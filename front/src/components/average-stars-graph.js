/* hier word de gemiddelde sterren per film berekend, weergegeven
als een grafiek met d3 , het is een herimporteerbaar component */

import { select, scaleLinear, symbol, symbolStar } from 'd3'
import { animateAverageStarsGlow } from '../lib/animations.js'
import { getJson } from '../lib/api-opvragingen.js'

class AverageStarsGraph extends HTMLElement {
  constructor() {
    super()
    this.averageStars = 0
    this.handleCommentsUpdated = null
  }

  connectedCallback() {
    this.renderBase()
    this.loadData()

    this.handleCommentsUpdated = (event) => {
      const currentQid = this.getAttribute('data-qid')
      const updatedQid = event.detail?.qid

      if (currentQid && updatedQid && currentQid === updatedQid) {
        this.loadData()
      }
    }

    window.addEventListener('comments-updated', this.handleCommentsUpdated)
  }

  disconnectedCallback() {
    if (this.handleCommentsUpdated) {
      window.removeEventListener('comments-updated', this.handleCommentsUpdated)
    }
  }

  renderBase() {
    this.innerHTML = `
      <div class="average-stars-graph__inner">
        <p class="average-stars-graph__value"></p>
        <div class="average-stars-graph__chart"></div>
      </div>
    `
  }

  async loadData() {
    const qid = this.getAttribute('data-qid')

    if (!qid) {
      this.averageStars = 0
      this.drawChart()
      return
    }

    try {
      const data = await getJson(`/comments/${qid}`, 'Kon comments niet ophalen.')
      this.averageStars = Number(data.averageStars) || 0
    } catch (error) {
      console.error('Kon gemiddelde sterren niet ophalen:', error)
      this.averageStars = 0
    }

    this.drawChart()
  }

  getStarArray() {
    const rounded = Math.floor(this.averageStars)
    const result = []

    for (let i = 1; i <= 5; i += 1) {
      result.push(i <= rounded ? 1 : 0)
    }

    return result
  }

  drawChart() {
    const chart = this.querySelector('.average-stars-graph__chart')
    const value = this.querySelector('.average-stars-graph__value')

    if (!chart || !value) return

    chart.innerHTML = ''

    const data = this.getStarArray()
    const width = 260
    const height = 90

    const svg = select(chart)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height)

    const xScale = scaleLinear().domain([0, 4]).range([30, width - 30])
    const yScale = scaleLinear().domain([0, 1]).range([height - 25, 25])

    const starShape = symbol().type(symbolStar).size(220)
    const displayValue = Number.isInteger(this.averageStars)
      ? this.averageStars
      : this.averageStars.toFixed(1)

    svg
      .selectAll('.punt')
      .data(data)
      .enter()
      .append('path')
      .attr('class', (d) => (d ? 'punt punt--filled' : 'punt punt--empty'))
      .attr('d', starShape)
      .attr('transform', (d, i) => `translate(${xScale(i)}, ${yScale(d)})`)
      .attr('fill', (d) => (d ? 'gold' : 'transparent'))

    animateAverageStarsGlow(this)

    value.textContent = `Gemiddelde sterren: ${displayValue}/5`
  }
}

customElements.define('average-stars-graph', AverageStarsGraph)