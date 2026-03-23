/* dit bestand bevat de functie die de film zoek functionaliteit initialiseert, zoals het toevoegen van event listeners aan de zoekinput 
en de zoekknop, het uitvoeren van de zoekopdracht met een debounce, en het weergeven van de zoekresultaten of foutmeldingen, deze functie 
wordt aangeroepen in de main.js om de film zoek functionaliteit te activeren */

import movies from '../data/films-basic.json'
import { addMovieToArchive, fetchArchiveMovies, searchMovies} from './archive-api.js'
import { refreshScrollAnimations } from './animations.js'
import { mergeMovies } from './mergemovies.js'
import { renderMovieSearchEmpty, renderMovieSearchError, renderMovieSearchLoading, renderMovieSearchResults} from './movie-search-weergave.js'

export function initMovieSearch(app, archive, quiz) {
  const searchInput = app.querySelector('.movie-search__input')
  const searchButton = app.querySelector('.movie-search__button')
  const searchResults = app.querySelector('.movie-search__results')

  if (!searchInput || !searchButton || !searchResults) return

  let debounceTimer = null
  let currentResults = []

  async function syncArchiveAndQuiz() {
    const updatedArchiveMovies = await fetchArchiveMovies()
    const updatedMergedMovies = mergeMovies(movies, updatedArchiveMovies)

    archive.items = updatedMergedMovies
    archive.initialize()
    quiz.setItems(updatedMergedMovies)
  }

  async function handleAddButtonClick(event) {
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

      requestAnimationFrame(() => {
        refreshScrollAnimations()
      })
    } catch (error) {
      console.error('Film toevoegen mislukt:', error)
      alert(error.message || 'Kon film niet toevoegen.')
    }
  }

  async function runMovieSearch() {
    const title = searchInput.value.trim()

    if (title.length < 2) {
      searchResults.innerHTML = ''
      currentResults = []
      return
    }

    renderMovieSearchLoading(searchResults)

    try {
      const results = await searchMovies(title)
      currentResults = results

      if (!results.length) {
        renderMovieSearchEmpty(searchResults)
        return
      }

      renderMovieSearchResults(searchResults, results)

      requestAnimationFrame(() => {
        refreshScrollAnimations()
      })
    } catch (error) {
      console.error('Film zoeken mislukt:', error)
      renderMovieSearchError(searchResults)
    }
  }

  function debounceSearch() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      runMovieSearch()
    }, 400)
  }

  searchInput.addEventListener('input', debounceSearch)

  searchButton.addEventListener('click', () => {
    clearTimeout(debounceTimer)
    runMovieSearch()
  })

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      clearTimeout(debounceTimer)
      runMovieSearch()
    }
  })

  searchResults.addEventListener('click', handleAddButtonClick)
}