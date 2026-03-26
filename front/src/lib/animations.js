/* dit bestand bevat alle animatiefuncties die in de app worden gebruikt, zoals scroll animaties, 
hover animaties en quiz animaties */

import { gsap } from 'gsap'

let hoverIsReady = false

export function initScrollAnimations(root = document) {
  const sections = root.querySelectorAll('.films-section')

  sections.forEach((section, index) => {
    if (section.dataset.animated === '1') return

    section.dataset.animated = '1'

    gsap.fromTo(
      section,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        delay: index * 0.04
      }
    )
  })
}

export function refreshScrollAnimations() {
  initScrollAnimations()
}

export function initHoverAnimations(root = document) {
  if (hoverIsReady) return
  hoverIsReady = true

  root.addEventListener('mouseover', (event) => {
    const card = event.target.closest('.simple-poster-card')
    const button = event.target.closest('app-button .app-button, .movie-search__button, .movie-search__add-button')
    const star = event.target.closest('.film-chat__star')

    if (card) {
      gsap.to(card, { y: -4, duration: 0.15 })
    }

    if (button) {
      gsap.to(button, { y: -2, duration: 0.15 })
    }

    if (star && !star.classList.contains('is-active')) {
      gsap.to(star, { y: -1, duration: 0.1 })
    }
  })

  root.addEventListener('mouseout', (event) => {
    const card = event.target.closest('.simple-poster-card')
    const button = event.target.closest('app-button .app-button, .movie-search__button, .movie-search__add-button')
    const star = event.target.closest('.film-chat__star')

    if (card) {
      gsap.to(card, { y: 0, duration: 0.15 })
    }

    if (button) {
      gsap.to(button, { y: 0, duration: 0.15 })
    }

    if (star && !star.classList.contains('is-active')) {
      gsap.to(star, { y: 0, duration: 0.1 })
    }
  })
}

export function animateLikeButton(button) {
  gsap.fromTo(button, { scale: 1 }, { scale: 1.08, duration: 0.12, repeat: 1, yoyo: true })
}

export function animateDetailOpen(element) {
  gsap.fromTo(element, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.25 })
}

export function animateAverageStarsGlow(root) {
  if (!root) return

  const stars = root.querySelectorAll('.punt--filled')

  if (!stars.length) return

  gsap.to(stars, {
    opacity: 0.7,
    duration: 0.6,
    repeat: -1,
    yoyo: true,
    stagger: 0.05
  })
}

export function animateQuizCardIn(element) {
  if (!element) return
  gsap.fromTo(element, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25 })
}

export function animateQuizOptionsIn(elements) {
  if (!elements || !elements.length) return
  gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.05 })
}

export function animateQuizSelectedOption(element, onComplete) {
  if (!element) {
    if (typeof onComplete === 'function') onComplete()
    return
  }

  gsap.to(element, {
    scale: 1.03,
    duration: 0.1,
    repeat: 1,
    yoyo: true,
    onComplete
  })
}

export function animateQuizQuestionOut(element, onComplete) {
  if (!element) {
    if (typeof onComplete === 'function') onComplete()
    return
  }

  gsap.to(element, {
    opacity: 0,
    y: -8,
    duration: 0.18,
    onComplete
  })
}

export function animateQuizResultsIn(elements) {
  if (!elements || !elements.length) return
  gsap.fromTo(elements, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.22, stagger: 0.06 })
}

export function animateQuizDetailIn(element) {
  if (!element) return
  gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration: 0.2 })
}

export function animateQuizResultSelection(element) {
  if (!element) return
  gsap.fromTo(element, { scale: 0.99 }, { scale: 1.02, duration: 0.12, repeat: 1, yoyo: true })
}

export function animateQuizResetOut(element, onComplete) {
  if (!element) {
    if (typeof onComplete === 'function') onComplete()
    return
  }

  gsap.to(element, {
    opacity: 0,
    duration: 0.15,
    onComplete
  })
}