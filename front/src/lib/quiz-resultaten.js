/* dit bestand bevat alle functies die nodig zijn om de quiz resultaten te bepalen op basis van de antwoorden van de gebruiker in de quiz,
zoals het filteren van de films op genre, periode en runtime, en het kiezen van de beste matches om aan de gebruiker te tonen, deze
 functies worden gebruikt in de quiz component om de resultaten te berekenen en weer te geven */

 import movies from '../data/films-basic.json'
import {
  addMovieToArchive,
  fetchArchiveMovies,
  searchMovies
} from './api.js'
import { refreshScrollAnimations } from './animations.js'
import { mergeMovies } from './mergemovies.js'

function renderLoading(container) {
  container.innerHTML = '<p>Zoeken...</p>'
}

function renderEmpty(container) {
  container.innerHTML = '<p>Geen resultaten gevonden.</p>'
}

function renderError(container) {
  container.innerHTML = '<p>Zoeken mislukt.</p>'
}

function renderResults(container, results) {
  container.innerHTML = results
    .map(
      (movie, index) => `
        <article class="movie-search__result">
          <p><strong>${movie.title}</strong></p>
          <p>QID: ${movie.wikidataId}</p>
          <button class="movie-search__add-button" type="button" data-result-index="${index}">
            Toevoegen aan archief
          </button>
        </article>
      `
    )
    .join('')
}

export function initMovieSearch(app, archive, quiz) {
  const searchInput = app.querySelector('.movie-search__input')
  const searchButton = app.querySelector('.movie-search__button')
  const searchResults = app.querySelector('.movie-search__results')

  if (!searchInput || !searchButton || !searchResults) return

  let timer = null
  let currentResults = []

  async function syncArchiveAndQuiz() {
    const updatedArchiveMovies = await fetchArchiveMovies()
    const updatedMergedMovies = mergeMovies(movies, updatedArchiveMovies)

    archive.items = updatedMergedMovies
    archive.initialize()
    quiz.setItems(updatedMergedMovies)
  }

  async function addMovie(event) {
    const button = event.target.closest('.movie-search__add-button')
    if (!button) return

    const index = Number(button.dataset.resultIndex)
    const selectedMovie = currentResults[index]

    if (!selectedMovie) return

    try {
      const response = await addMovieToArchive(selectedMovie)
      alert(response.message)
      await syncArchiveAndQuiz()
      searchInput.value = ''
      searchResults.innerHTML = ''
      currentResults = []
      refreshScrollAnimations()
    } catch (error) {
      console.error('Film toevoegen mislukt:', error)
      alert(error.message || 'Kon film niet toevoegen.')
    }
  }

  async function runSearch() {
    const title = searchInput.value.trim()

    if (title.length < 2) {
      searchResults.innerHTML = ''
      currentResults = []
      return
    }

    renderLoading(searchResults)

    try {
      const results = await searchMovies(title)
      currentResults = results

      if (!results.length) {
        renderEmpty(searchResults)
        return
      }

      renderResults(searchResults, results)
      refreshScrollAnimations()
    } catch (error) {
      console.error('Film zoeken mislukt:', error)
      renderError(searchResults)
    }
  }

  function queueSearch() {
    clearTimeout(timer)
    timer = setTimeout(runSearch, 450)
  }

  searchInput.addEventListener('input', queueSearch)
  searchButton.addEventListener('click', () => {
    clearTimeout(timer)
    runSearch()
  })
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      clearTimeout(timer)
      runSearch()
    }
  })
  searchResults.addEventListener('click', addMovie)
}