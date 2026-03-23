/* dit is het component dat de filmkaart weergeeft, zowel in poster als detail modus
in poster modus worden alleen de poster en titel weergegeven in detail modus worden alle
 details van de film weergegeven
het is een herimporteerbaar component dat op meerdere plekken in de app word gebruikt */

import { animateLikeButton } from '../lib/animations.js'
import { fetchWikidataFilmDetails } from '../lib/fetchWikidatafilmdetails.js'
import { buildDetailData, hasEnoughDetailData } from '../lib/film-details-data.js'
import { getStoredLikes, saveStoredLikes } from '../lib/likes-opslag.js'

class FilmCard extends HTMLElement {
  constructor() {
    super()
    this.likes = 0
  }

  async connectedCallback() {
    const mode = this.getAttribute('mode') || 'poster'
    const film = this.getFilmData()

    if (!film) {
      this.innerHTML = '<p>Geen filmdata gevonden.</p>'
      return
    }

    if (mode === 'poster') {
      this.renderPoster(film)
      return
    }

    await this.renderDetail(film)
  }

  getFilmData() {
    const rawData = this.getAttribute('data-film')

    if (!rawData) return null

    try {
      return JSON.parse(decodeURIComponent(rawData))
    } catch {
      return null
    }
  }

  renderPoster(film) {
    const selected = this.getAttribute('selected') === 'true'

    this.innerHTML = `
      <div class="simple-poster-card ${selected ? 'selected' : ''}">
        ${
          film.image
            ? `<img src="${film.image}" alt="${film.title}" class="simple-poster-image" />`
            : `<div class="simple-poster-placeholder">${film.title}</div>`
        }
      </div>
    `
  }

  renderPosterMedia(film, detailTitle) {
    const image = film.poster || film.image || ''

    if (!image) {
      return `<div class="simple-poster-placeholder">${detailTitle || film.title}</div>`
    }

    return `
      <img
        src="${image}"
        alt="${detailTitle || film.title}"
        class="film-detail-poster"
      />
    `
  }

  async renderDetail(film) {
    this.likes = getStoredLikes(film)

    this.innerHTML = `
      <div class="film-detail-card">
        <p>Filmgegevens laden...</p>
      </div>
    `

    let wikidata = {}

    if (film.wikidataId && !hasEnoughDetailData(film)) {
      try {
        wikidata = await fetchWikidataFilmDetails(film.wikidataId)
      } catch {
        wikidata = {}
      }
    }

    const detail = buildDetailData(film, wikidata)

    const infoLines = [
      detail.year ? `<p><strong>Jaar:</strong> ${detail.year}</p>` : '',
      detail.directors.length
        ? `<p><strong>Regisseur:</strong> ${detail.directors.join(', ')}</p>`
        : '',
      detail.genres.length
        ? `<p><strong>Genre:</strong> ${detail.genres.join(', ')}</p>`
        : '',
      detail.runtimeMinutes
        ? `<p><strong>Duur:</strong> ${detail.runtimeMinutes} min</p>`
        : '',
      detail.languages.length
        ? `<p><strong>Taal:</strong> ${detail.languages.join(', ')}</p>`
        : '',
      detail.countries.length
        ? `<p><strong>Land:</strong> ${detail.countries.join(', ')}</p>`
        : ''
    ]
      .filter(Boolean)
      .join('')

    const castHtml = detail.cast.length
      ? `
        <div class="extra-info-box">
          <h3>Cast</h3>
          <p>${detail.cast.join(', ')}</p>
        </div>
      `
      : ''

    this.innerHTML = `
      <div class="film-detail-card">
        <div class="film-detail-layout">
          <div class="film-detail-left">
            ${this.renderPosterMedia(film, detail.title)}
            <average-stars-graph
              class="film-detail-stars"
              data-qid="${film.wikidataId || 0}"
            ></average-stars-graph>
          </div>

          <div class="film-detail-right">
            <h2>${detail.title || film.title}</h2>

            <p>${film.description || ''}</p>

            <p><strong><span class="likes-count">${this.likes}</span> likes</strong></p>
            <app-button
              class="like-button"
              type="button"
              variant="icon"
              label="❤️"
              aria-label="Like deze film"
            ></app-button>

            <div class="extra-info-box">
              <h3>Meer info over deze film</h3>
              ${infoLines || '<p>Nog geen extra info beschikbaar.</p>'}
            </div>

            ${castHtml}

            <film-comments data-film="${encodeURIComponent(JSON.stringify(film))}"></film-comments>
          </div>
        </div>
      </div>
    `

    this.addLikeEvent(film)
  }

  addLikeEvent(film) {
    const button = this.querySelector('.like-button')
    const likesText = this.querySelector('.likes-count')

    if (!button || !likesText) return

    button.addEventListener('click', () => {
      this.likes += 1
      likesText.textContent = this.likes
      saveStoredLikes(film, this.likes)
      animateLikeButton(button)
    })
  }
}

customElements.define('film-card', FilmCard)