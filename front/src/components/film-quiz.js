/* dit is het component dat de film quiz weergeeft, hier kunnen gebruikers een korte quiz doen om een
 film aanbeveling te krijgen op basis van hun voorkeuren
de quiz heeft 3 vragen over genre, periode en tijd, en geeft aan het einde 3 film aanbevelingen die
 het beste bij de antwoorden passen
het maakt gebruik van een web worker om de quiz resultaten te berekenen zonder de UI te blokkeren */

import {
  animateQuizCardIn,
  animateQuizDetailIn,
  animateQuizOptionsIn,
  animateQuizQuestionOut,
  animateQuizResetOut,
  animateQuizResultSelection,
  animateQuizResultsIn,
  animateQuizSelectedOption
} from '../lib/animations.js'

const QUESTIONS = [
  {
    key: 'genre',
    title: 'Welk soort film heb je zin in?',
    options: [
      { value: 'action', label: 'Actie / avontuur' },
      { value: 'comedy', label: 'Komedie / luchtig' },
      { value: 'romance', label: 'Romantiek / emotioneel' },
      { value: 'dark', label: 'Donker / psychologisch' },
      { value: 'fantasy', label: 'Fantasie / sci-fi' }
    ]
  },
  {
    key: 'period',
    title: 'Heb je zin in iets moderns of eerder klassiek?',
    options: [
      { value: 'modern', label: 'Modern' },
      { value: 'classic', label: 'Klassieker' },
      { value: 'any', label: 'Maakt niet uit' }
    ]
  },
  {
    key: 'time',
    title: 'Hoeveel tijd heb je?',
    options: [
      { value: 'short', label: 'Kort en krachtig' },
      { value: 'medium', label: 'Gemiddeld' },
      { value: 'long', label: 'Ik heb tijd' }
    ]
  }
]

const quizWorker = new Worker(
  new URL('../workers/quiz-worker.js', import.meta.url),
  { type: 'module' }
)

class FilmQuiz extends HTMLElement {
  constructor() {
    super()
    this.items = []
    this.answers = {
      genre: null,
      period: null,
      time: null
    }
    this.step = 0
    this.results = []
    this.selectedMovie = null
    this._eventsBound = false
  }

  connectedCallback() {
    if (!this.items.length) {
      const itemsAttr = this.getAttribute('items')

      try {
        this.items = itemsAttr ? JSON.parse(itemsAttr) : []
      } catch {
        this.items = []
      }
    }

    this.render()
    this.addEvents()
    this.animateCurrentView()
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : []
    this.resetQuiz()
    this.render()
    this.animateCurrentView()
  }

  resetQuiz() {
    this.answers = {
      genre: null,
      period: null,
      time: null
    }
    this.step = 0
    this.results = []
    this.selectedMovie = null
  }

  calculateResults() {
    return new Promise((resolve) => {
      quizWorker.onmessage = (event) => {
        this.results = event.data
        this.selectedMovie = this.results[0] || null
        resolve()
      }

      quizWorker.postMessage({
        items: this.items,
        answers: this.answers
      })
    })
  }

  renderQuestion() {
    const currentQuestion = QUESTIONS[this.step]
    const progressPercent = ((this.step + 1) / QUESTIONS.length) * 100

    return `
      <div class="film-quiz__question-box">
        <div class="film-quiz__progress" aria-hidden="true">
          <div
            class="film-quiz__progress-fill"
            style="width: ${progressPercent}%"
          ></div>
        </div>

        <p class="film-quiz__step">Vraag ${this.step + 1} van ${QUESTIONS.length}</p>
        <h3 class="film-quiz__question-title">${currentQuestion.title}</h3>

        <div class="film-quiz__options">
          ${currentQuestion.options
            .map(
              (option) => `
                <app-button
                  class="film-quiz__option"
                  type="button"
                  variant="option"
                  data-key="${currentQuestion.key}"
                  data-value="${option.value}"
                  label="${option.label}"
                ></app-button>
              `
            )
            .join('')}
        </div>
      </div>
    `
  }

  renderResults() {
    const resultsHtml = this.results
      .map((movie, index) => {
        const movieString = encodeURIComponent(JSON.stringify(movie))

        return `
          <div
            class="film-quiz__result-card ${this.selectedMovie?.title === movie.title ? 'is-selected' : ''}"
            data-index="${index}"
          >
            <film-card mode="poster" data-film="${movieString}"></film-card>
            <p class="film-quiz__result-title">${movie.title}</p>
          </div>
        `
      })
      .join('')

    const selectedMovieHtml = this.selectedMovie
      ? `
        <div class="film-quiz__detail">
          <film-card
            mode="detail"
            data-film="${encodeURIComponent(JSON.stringify(this.selectedMovie))}"
          ></film-card>
        </div>
      `
      : ''

    return `
      <div class="film-quiz__results-box">
        <h3 class="film-quiz__question-title">
          Deze 3 films passen het best bij jouw voorkeur vandaag
        </h3>

        <div class="film-quiz__results-grid">
          ${resultsHtml}
        </div>

        <div class="film-quiz__actions">
          <app-button
            class="film-quiz__restart"
            type="button"
            variant="primary"
            label="Quiz opnieuw doen"
          ></app-button>
        </div>

        ${selectedMovieHtml}
      </div>
    `
  }

  render() {
    if (!this.items.length) {
      this.innerHTML = '<p>Geen films beschikbaar voor de quiz.</p>'
      return
    }

    this.innerHTML = `
      <div class="film-quiz">
        ${this.step < QUESTIONS.length ? this.renderQuestion() : this.renderResults()}
      </div>
    `
  }

  animateCurrentView() {
    const questionBox = this.querySelector('.film-quiz__question-box')
    const resultCards = this.querySelectorAll('.film-quiz__result-card')
    const detailBox = this.querySelector('.film-quiz__detail')

    if (questionBox) {
      animateQuizCardIn(questionBox)
      animateQuizOptionsIn(questionBox.querySelectorAll('.film-quiz__option'))
    }

    if (resultCards.length) {
      animateQuizResultsIn(resultCards)
    }

    if (detailBox) {
      animateQuizDetailIn(detailBox)
    }
  }

  async goToNextStep() {
    if (this.step >= QUESTIONS.length) return

    this.step += 1

    if (this.step >= QUESTIONS.length) {
      await this.calculateResults()
    }

    this.render()
    this.animateCurrentView()
  }

  handleOptionClick(optionButton) {
    const key = optionButton.getAttribute('data-key')
    const value = optionButton.getAttribute('data-value')
    const questionBox = this.querySelector('.film-quiz__question-box')

    this.answers[key] = value

    animateQuizSelectedOption(optionButton, () => {
      if (!questionBox) {
        this.goToNextStep()
        return
      }

      animateQuizQuestionOut(questionBox, () => {
        this.goToNextStep()
      })
    })
  }

  handleRestartClick() {
    const resultsBox = this.querySelector('.film-quiz__results-box')

    if (!resultsBox) {
      this.resetQuiz()
      this.render()
      this.animateCurrentView()
      return
    }

    animateQuizResetOut(resultsBox, () => {
      this.resetQuiz()
      this.render()
      this.animateCurrentView()
    })
  }

  handleResultCardClick(resultCard) {
    const index = Number(resultCard.getAttribute('data-index'))
    this.selectedMovie = this.results[index]

    this.render()
    this.animateCurrentView()

    const updatedSelectedCard = this.querySelector(
      `.film-quiz__result-card[data-index="${index}"]`
    )

    if (updatedSelectedCard) {
      animateQuizResultSelection(updatedSelectedCard)
    }

    requestAnimationFrame(() => {
      const detailElement = this.querySelector('.film-quiz__detail')

      if (detailElement) {
        detailElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  }

  addEvents() {
    if (this._eventsBound) return
    this._eventsBound = true

    this.addEventListener('click', (event) => {
      const optionButton = event.target.closest('.film-quiz__option')
      const restartButton = event.target.closest('.film-quiz__restart')
      const resultCard = event.target.closest('.film-quiz__result-card')

      if (optionButton) {
        this.handleOptionClick(optionButton)
        return
      }

      if (restartButton) {
        this.handleRestartClick()
        return
      }

      if (resultCard) {
        this.handleResultCardClick(resultCard)
      }
    })
  }
}

customElements.define('film-quiz', FilmQuiz)