/* dit is het component dat de film browser weergeeft,
hier worden de films als posters weergegeven, en kunnen gebruikers op 
een poster klikken om de details van een film te bekijken */

import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { animateDetailOpen } from '../lib/animations.js'

gsap.registerPlugin(ScrollToPlugin)

class FilmBrowser extends HTMLElement {
  constructor() {
    super()
    this.items = []
    this.selectedIndex = null
    this._eventsBound = false
    this.posterScrollTop = 0
  }

  connectedCallback() {
    if (!this.items.length) {
      this.readItemsAttribute()
    }

    this.render()
    this.addEvents()
  }

  readItemsAttribute() {
    const itemsAttr = this.getAttribute('items')

    try {
      this.items = itemsAttr ? JSON.parse(itemsAttr) : []
    } catch {
      this.items = []
    }
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : []
    this.selectedIndex = null
    this.posterScrollTop = 0
    this.render()
  }

  render() {
    if (!this.items.length) {
      this.innerHTML = '<p>Geen films gevonden.</p>'
      return
    }

    const postersHtml = this.items
      .map((film, index) => {
        const filmString = encodeURIComponent(JSON.stringify(film))

        return `
          <film-card
            mode="poster"
            data-index="${index}"
            data-film="${filmString}"
            ${index === this.selectedIndex ? 'selected="true"' : ''}
          ></film-card>
        `
      })
      .join('')

    let detailHtml = ''

    if (this.selectedIndex !== null) {
      const selectedFilm = this.items[this.selectedIndex]
      const selectedFilmString = encodeURIComponent(JSON.stringify(selectedFilm))

      detailHtml = `
        <div class="film-browser__detail-frame">
          <div class="film-detail-topbar">
            <app-button
              class="film-detail-close"
              type="button"
              variant="ghost"
              label="Sluiten ✕"
            ></app-button>
          </div>

          <film-card
            mode="detail"
            data-film="${selectedFilmString}"
          ></film-card>
        </div>
      `
    }

    this.innerHTML = `
      <div class="film-browser">
        <div class="film-browser__poster-frame">
          <div class="film-browser__poster-scroll">
            ${postersHtml}
          </div>
        </div>

        ${detailHtml}
      </div>
    `

    const posterFrame = this.querySelector('.film-browser__poster-frame')

    if (posterFrame) {
      posterFrame.scrollTop = this.posterScrollTop
    }
  }

  addEvents() {
    if (this._eventsBound) return
    this._eventsBound = true

    this.addEventListener('click', (event) => {
      const posterCard = event.target.closest('film-card[mode="poster"]')
      const closeButton = event.target.closest('.film-detail-close')

      if (posterCard) {
        const currentPosterFrame = this.querySelector('.film-browser__poster-frame')
        this.posterScrollTop = currentPosterFrame ? currentPosterFrame.scrollTop : 0

        const index = Number(posterCard.getAttribute('data-index'))
        this.selectedIndex = this.selectedIndex === index ? null : index
        this.render()

        if (this.selectedIndex !== null) {
          requestAnimationFrame(() => {
            const detailElement = this.querySelector('.film-browser__detail-frame')

            if (!detailElement) return

            animateDetailOpen(detailElement)

            gsap.to(window, {
              duration: 0.9,
              scrollTo: {
                y: detailElement,
                offsetY: 20
              },
              ease: 'power2.out'
            })
          })
        }

        return
      }

      if (closeButton) {
        const currentPosterFrame = this.querySelector('.film-browser__poster-frame')
        this.posterScrollTop = currentPosterFrame ? currentPosterFrame.scrollTop : 0

        this.selectedIndex = null
        this.render()
      }
    })
  }
}

customElements.define('film-browser', FilmBrowser)