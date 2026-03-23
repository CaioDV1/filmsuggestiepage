/* dit is het component dat de film archief pagina weergeeft,
hier kunnen gebruikers zoeken, filteren en sorteren door alle films die in het archief staan
het maakt gebruik van het film-browser component om de gefilterde films weer te geven */

import { applyMovieFilters, getAvailableGenres } from '../lib/filtermovies.js'

class FilmArchive extends HTMLElement {
  constructor() {
    super()
    this.items = []
    this.filteredItems = []
    this.searchTerm = ''
    this.selectedGenre = ''
    this.selectedSort = ''
    this.isLoading = true
    this._eventsBound = false
  }

  connectedCallback() {
    this.render()
    this.addEvents()
  }

  initialize() {
    this.isLoading = false
    this.filteredItems = [...this.items]
    this.render()
    this.applyFilters()
  }

  getGenreOptions() {
    return getAvailableGenres(this.items)
      .map(
        (genre) =>
          `<option value="${genre}" ${this.selectedGenre === genre ? 'selected' : ''}>${genre}</option>`
      )
      .join('')
  }

  render() {
    if (this.isLoading) {
      this.innerHTML = `
        <div class="film-archive">
          <div class="film-archive__controls">
            <p class="film-archive__loading">Filmgegevens laden via Wikidata...</p>
          </div>
        </div>
      `
      return
    }

    this.innerHTML = `
      <div class="film-archive">
        <div class="film-archive__controls">
          <div class="film-archive__filters">
            <input
              type="text"
              class="film-archive__search"
              placeholder="Zoek op filmtitel..."
              value="${this.searchTerm}"
            />

            <select class="film-archive__select film-archive__genre">
              <option value="">Alle genres</option>
              ${this.getGenreOptions()}
            </select>

            <select class="film-archive__select film-archive__sort">
              <option value="">Geen sortering</option>
              <option value="title-asc" ${this.selectedSort === 'title-asc' ? 'selected' : ''}>Titel A-Z</option>
              <option value="title-desc" ${this.selectedSort === 'title-desc' ? 'selected' : ''}>Titel Z-A</option>
              <option value="year-asc" ${this.selectedSort === 'year-asc' ? 'selected' : ''}>Jaar oplopend</option>
              <option value="year-desc" ${this.selectedSort === 'year-desc' ? 'selected' : ''}>Jaar aflopend</option>
            </select>
          </div>

          <p class="film-archive__count">${this.filteredItems.length} films gevonden</p>
        </div>

        <film-browser></film-browser>
      </div>
    `
  }

  addEvents() {
    if (this._eventsBound) return
    this._eventsBound = true

    this.addEventListener('input', (event) => {
      if (event.target.matches('.film-archive__search')) {
        this.searchTerm = event.target.value
        this.applyFilters()
      }
    })

    this.addEventListener('change', (event) => {
      if (event.target.matches('.film-archive__genre')) {
        this.selectedGenre = event.target.value
        this.applyFilters()
        return
      }

      if (event.target.matches('.film-archive__sort')) {
        this.selectedSort = event.target.value
        this.applyFilters()
      }
    })
  }

  applyFilters() {
    this.filteredItems = applyMovieFilters(this.items, {
      searchTerm: this.searchTerm,
      genre: this.selectedGenre,
      sort: this.selectedSort
    })

    this.updateCount()
    this.updateBrowser()
  }

  updateCount() {
    const countElement = this.querySelector('.film-archive__count')

    if (countElement) {
      countElement.textContent = `${this.filteredItems.length} films gevonden`
    }
  }

  updateBrowser() {
    const browser = this.querySelector('film-browser')

    if (browser) {
      browser.setItems(this.filteredItems)
    }
  }
}

customElements.define('film-archive', FilmArchive)