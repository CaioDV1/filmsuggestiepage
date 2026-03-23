/* dit is het component dat de film carousel weergeeft,
hier worden de films als posters weergegeven in een oneindige scrollende carousel
het is gemaakt met p5.js */

import p5 from 'p5'

class FilmCarousel extends HTMLElement {
  constructor() {
    super()
    this._p5Instance = null
    this._container = null
    this._items = []
  }

  async connectedCallback() {
    this._items = await this.getItems()

    this.innerHTML = `
      <div class="film-carousel">
        <div class="film-carousel__title-box">
          <h1 class="film-carousel__title">${this.getAttribute('title') || ''}</h1>
        </div>
        <div class="film-carousel__canvas"></div>
      </div>
    `

    this._container = this.querySelector('.film-carousel__canvas')
    this.mountSketch()
  }

  disconnectedCallback() {
    if (this._p5Instance) {
      this._p5Instance.remove()
      this._p5Instance = null
    }
  }

  async getItems() {
    if (Array.isArray(this.items) && this.items.length > 0) {
      return this.items
    }

    const src = this.getAttribute('src')
    const itemsAttr = this.getAttribute('items')

    if (src) {
      try {
        const response = await fetch(src)
        const data = await response.json()

        if (Array.isArray(data)) return data
        if (Array.isArray(data.items)) return data.items
      } catch (error) {
        console.error('Kon carousel JSON niet laden:', error)
      }

      return []
    }

    if (itemsAttr) {
      try {
        return JSON.parse(itemsAttr)
      } catch (error) {
        console.error('Kon items niet parsen:', error)
      }
    }

    return []
  }

  mountSketch() {
    const host = this
    let currentSpeed = 0
    let targetSpeed = 0

    this._p5Instance = new p5((p) => {
      let posters = []
      let globalOffset = 0

      let posterWidth = 210
      let posterHeight = 300
      let gap = 24
      let baseSpeed = 1.1
      let bandGap = 18

      const BAND_COUNT = 3

      const SETTINGS = {
        speedMin: 0.05,
        speedMax: 2.8,
        background: '#000000',
        cardInset: 8,
        cardRadius: 13,
        bandShiftFactor: 6.5,
        baseSpeedMobile: 0.9,
        baseSpeedTablet: 1,
        baseSpeedLaptop: 1.05,
        baseSpeedDesktop: 1.1
      }

      function updateResponsiveSizes() {
        const width = host.clientWidth
        const height = host.clientHeight

        if (width < 600) {
          posterWidth = 95
          posterHeight = 145
          gap = 12
          bandGap = 12
          baseSpeed = SETTINGS.baseSpeedMobile
        } else if (width < 900) {
          posterWidth = 130
          posterHeight = 190
          gap = 14
          bandGap = 14
          baseSpeed = SETTINGS.baseSpeedTablet
        } else if (width < 1200) {
          posterWidth = 170
          posterHeight = 245
          gap = 18
          bandGap = 16
          baseSpeed = SETTINGS.baseSpeedLaptop
        } else {
          posterWidth = 210
          posterHeight = 300
          gap = 24
          bandGap = 18
          baseSpeed = SETTINGS.baseSpeedDesktop
        }

        if (height < 700) {
          posterWidth *= 0.88
          posterHeight *= 0.88
          gap *= 0.9
          bandGap *= 0.9
        }

        posterWidth = Math.round(posterWidth)
        posterHeight = Math.round(posterHeight)
        gap = Math.round(gap)
        bandGap = Math.round(bandGap)
      }

      function roundedRectClip(graphics, x, y, width, height, radius) {
        const ctx = graphics.drawingContext

        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.clip()
      }

      function makePoster(item, index) {
        const graphic = p.createGraphics(posterWidth, posterHeight)
        const bg = item.color || [40 + index * 5, 30 + index * 3, 50]

        graphic.clear()

        if (item._image && item._image.width > 0) {
          graphic.push()
          graphic.drawingContext.save()

          roundedRectClip(
            graphic,
            SETTINGS.cardInset,
            SETTINGS.cardInset,
            graphic.width - SETTINGS.cardInset * 2,
            graphic.height - SETTINGS.cardInset * 2,
            SETTINGS.cardRadius
          )

          graphic.image(
            item._image,
            SETTINGS.cardInset,
            SETTINGS.cardInset,
            graphic.width - SETTINGS.cardInset * 2,
            graphic.height - SETTINGS.cardInset * 2
          )

          graphic.drawingContext.restore()
          graphic.pop()
        } else {
          graphic.noStroke()
          graphic.fill(bg[0], bg[1], bg[2])
          graphic.rect(
            SETTINGS.cardInset,
            SETTINGS.cardInset,
            graphic.width - SETTINGS.cardInset * 2,
            graphic.height - SETTINGS.cardInset * 2,
            SETTINGS.cardRadius
          )
        }

        return { ...item, graphic }
      }

      function rebuildPosters() {
        posters = host._items.map((item, index) => {
          item._image = item.imageCache || null
          return makePoster(item, index)
        })
      }

      function loadImages() {
        host._items.forEach((item) => {
          if (!item.image || item.imageCache) return

          p.loadImage(
            item.image,
            (img) => {
              item.imageCache = img
              rebuildPosters()
            },
            () => {
              item.imageCache = null
              rebuildPosters()
            }
          )
        })
      }

      function updateScroll() {
        targetSpeed =
          baseSpeed *
          p.map(
            p.mouseX,
            0,
            p.width,
            SETTINGS.speedMin,
            SETTINGS.speedMax,
            true
          )

        currentSpeed = p.lerp(currentSpeed, targetSpeed, 0.08)
        globalOffset += currentSpeed
      }

      function drawPoster(item, x, y) {
        p.image(item.graphic, x, y, posterWidth, posterHeight)
      }

      function drawSingleBand(y, offset, patternWidth, cellWidth) {
        for (let i = -5; i < posters.length + 10; i += 1) {
          const posterIndex =
            ((i % posters.length) + posters.length) % posters.length
          const poster = posters[posterIndex]

          let x = i * cellWidth - (offset % patternWidth)

          while (x < -cellWidth) x += patternWidth
          while (x > p.width + cellWidth) x -= patternWidth

          drawPoster(poster, x, y)
        }
      }

      function drawBands() {
        if (!posters.length) return

        const cellWidth = posterWidth + gap
        const patternWidth = posters.length * cellWidth
        const totalBandHeight =
          BAND_COUNT * posterHeight + (BAND_COUNT - 1) * bandGap
        const startY = (p.height - totalBandHeight) / 2

        for (let band = 0; band < BAND_COUNT; band += 1) {
          const y = startY + band * (posterHeight + bandGap)
          const bandOffset =
            globalOffset + cellWidth * SETTINGS.bandShiftFactor * band

          drawSingleBand(y, bandOffset, patternWidth, cellWidth)
        }
      }

      p.setup = () => {
        const width = Math.max(host.clientWidth, 320)
        const height = Math.max(host.clientHeight, 320)

        const canvas = p.createCanvas(width, height)
        canvas.parent(host._container)

        updateResponsiveSizes()
        rebuildPosters()
        loadImages()
      }

      p.draw = () => {
        p.background(SETTINGS.background)
        updateScroll()
        drawBands()
      }

      p.windowResized = () => {
        const width = Math.max(host.clientWidth, 320)
        const height = Math.max(host.clientHeight, 320)

        p.resizeCanvas(width, height)
        updateResponsiveSizes()
        rebuildPosters()
      }
    })
  }
}

customElements.define('film-carousel', FilmCarousel)