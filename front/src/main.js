/* dit is het hoofd punt van de app, 
hier worden de componenten geladen en de app geïnitialiseerd
laad de basisdata, het verbind de delen van de frontend van elkaar */

import './cssmap/base.css'
import './cssmap/layout.css'
import './cssmap/components/app-button.css'
import './cssmap/components/film-archive.css'
import './cssmap/components/film-browser.css'
import './cssmap/components/film-card.css'
import './cssmap/components/film-carousel.css'
import './cssmap/components/film-comment.css'
import './cssmap/components/film-quiz.css'
import './cssmap/components/zoek-functie.css'

import './components/average-stars-graph.js'
import './components/app-button.js'
import './components/film-archive.js'
import './components/film-browser.js'
import './components/film-card.js'
import './components/film-carousel.js'
import './components/film-comment.js'
import './components/film-quiz.js'

import movies from './data/films-basic.json'
import { fetchArchiveMovies } from './lib/archive-api.js'
import {
  initHoverAnimations,
  initScrollAnimations,
  refreshScrollAnimations
} from './lib/animations.js'
import { enrichMoviesWithWikidata } from './lib/enrichmovieswithwikidata.js'
import { mergeMovies } from './lib/mergemovies.js'
import { initMovieSearch } from './lib/movie-search.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service worker geregistreerd')
    } catch (error) {
      console.error('Service worker registratie mislukt:', error)
    }
  })
}

function getRandomMovies(items, count) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count)
}

function renderApp(posterMovies) {
  return `
    <film-carousel
      class="hero-carousel"
      title="Welkom bij Film Suggesties"
      items='${JSON.stringify(
        posterMovies.map(({ title, image }) => ({ title, image }))
      )}'
    ></film-carousel>

    <section class="films-section">
      <div class="lijn"></div>
      <h2 class="films-section__title">Top 5 films van de dag</h2>
      <film-browser></film-browser>
    </section>

    <section class="films-section">
      <div class="lijn"></div>
      <h2 class="films-section__title">Weet je niet wat te kijken?</h2>
      <p class="films-section__loading js-quiz-loading">
        Quizgegevens worden op de achtergrond geladen...
      </p>
      <film-quiz></film-quiz>
    </section>

    <section class="films-section">
      <div class="lijn"></div>
      <h2 class="films-section__title">Bekijk ons hele filmarchief</h2>
      <p class="films-section__loading js-archive-loading">
        Extra filmgegevens worden op de achtergrond geladen...
      </p>
      <film-archive></film-archive>
    </section>

    <section class="films-section">
      <div class="lijn"></div>
      <h2 class="films-section__title">Zoek een andere film</h2>

      <div class="movie-search">
        <input
          type="text"
          class="movie-search__input"
          placeholder="Zoek op filmtitel..."
        />
        <button class="movie-search__button" type="button">Zoeken</button>
      </div>

      <div class="movie-search__results"></div>
    </section>
  `
}

async function initApp() {
  const app = document.querySelector('#app')

  if (!app) {
    console.error('Kon #app niet vinden.')
    return
  }

  const archiveMovies = await fetchArchiveMovies()
  const mergedMovies = mergeMovies(movies, archiveMovies)
  const posterMovies = mergedMovies.filter((movie) => movie.image)
  const topMoviesOfTheDay = getRandomMovies(posterMovies, 5)

  app.innerHTML = renderApp(posterMovies)

  const [topBrowser] = app.querySelectorAll('film-browser')
  const archive = app.querySelector('film-archive')
  const quiz = app.querySelector('film-quiz')
  const archiveLoading = app.querySelector('.js-archive-loading')
  const quizLoading = app.querySelector('.js-quiz-loading')

  topBrowser?.setItems(topMoviesOfTheDay)

  archive.items = mergedMovies
  archive.initialize()

  quiz.setItems(mergedMovies)

  initMovieSearch(app, archive, quiz)

  requestAnimationFrame(() => {
    initScrollAnimations()
    initHoverAnimations()
  })

  archiveLoading?.remove()
  quizLoading?.remove()

  requestAnimationFrame(() => {
    refreshScrollAnimations()
  })
    
}

initApp()