/* dit bestand bevat alle animatiefuncties die in de app worden gebruikt, zoals scroll animaties, 
hover animaties en quiz animaties */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let hoverEventsInitialized = false

function isRealHoverChange(element, relatedTarget) {
  return element && (!relatedTarget || !element.contains(relatedTarget))
}

function getHoverButton(event) {
  return (
    event.target.closest('app-button .app-button') ||
    event.target.closest('.movie-search__button') ||
    event.target.closest('.movie-search__add-button')
  )
}

export function initScrollAnimations(root = document) {
  const sections = root.querySelectorAll('.films-section')

  sections.forEach((section) => {
    if (section.dataset.gsapAnimated === 'true') return

    section.dataset.gsapAnimated = 'true'

    gsap.fromTo(
      section,
      {
        autoAlpha: 0,
        y: 40
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
          invalidateOnRefresh: true
        }
      }
    )
  })

  ScrollTrigger.refresh()
}

export function refreshScrollAnimations() {
  ScrollTrigger.refresh()
}

export function initHoverAnimations(root = document) {
  if (hoverEventsInitialized) return

  hoverEventsInitialized = true

  root.addEventListener('mouseover', (event) => {
    const card = event.target.closest('.simple-poster-card')

    if (card && isRealHoverChange(card, event.relatedTarget)) {
      gsap.to(card, {
        y: -6,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    const uiButton = getHoverButton(event)

    if (uiButton && isRealHoverChange(uiButton, event.relatedTarget)) {
      gsap.to(uiButton, {
        y: -2,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    const star = event.target.closest('.film-chat__star')

    if (
      star &&
      isRealHoverChange(star, event.relatedTarget) &&
      !star.classList.contains('is-active')
    ) {
      gsap.to(star, {
        y: -2,
        scale: 1.08,
        duration: 0.15,
        ease: 'power1.out',
        overwrite: 'auto'
      })
    }
  })

  root.addEventListener('mouseout', (event) => {
    const card = event.target.closest('.simple-poster-card')

    if (card && isRealHoverChange(card, event.relatedTarget)) {
      gsap.to(card, {
        y: 0,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    const uiButton = getHoverButton(event)

    if (uiButton && isRealHoverChange(uiButton, event.relatedTarget)) {
      gsap.to(uiButton, {
        y: 0,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    const star = event.target.closest('.film-chat__star')

    if (
      star &&
      isRealHoverChange(star, event.relatedTarget) &&
      !star.classList.contains('is-active')
    ) {
      gsap.to(star, {
        y: 0,
        scale: 1,
        duration: 0.15,
        ease: 'power1.out',
        overwrite: 'auto'
      })
    }
  })
}

export function animateLikeButton(button) {
  gsap.fromTo(
    button,
    { scale: 1 },
    {
      scale: 1.15,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power1.out'
    }
  )
}

export function animateDetailOpen(element) {
  gsap.fromTo(
    element,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
  )
}

export function animateAverageStarsGlow(root) {
  if (!root) return

  const stars = root.querySelectorAll('.punt--filled')
  if (!stars.length) return

  gsap.killTweensOf(stars)

  gsap.set(stars, {
    transformOrigin: '50% 50%',
    transformBox: 'fill-box'
  })

  gsap.to(stars, {
    scale: 1.15,
    fill: '#ffd700',
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    stagger: 0.08,
    ease: 'power1.inOut'
  })
}

export function animateQuizCardIn(element) {
  if (!element) return

  gsap.killTweensOf(element)

  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 24,
      scale: 0.985
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto'
    }
  )
}

export function animateQuizOptionsIn(elements) {
  if (!elements || !elements.length) return

  gsap.killTweensOf(elements)

  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 16
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.08,
      ease: 'power2.out',
      overwrite: 'auto',
      delay: 0.08
    }
  )
}

export function animateQuizSelectedOption(element, onComplete) {
  if (!element) {
    if (typeof onComplete === 'function') onComplete()
    return
  }

  gsap.killTweensOf(element)

  gsap.to(element, {
    scale: 1.05,
    duration: 0.14,
    yoyo: true,
    repeat: 1,
    ease: 'power2.out',
    overwrite: 'auto',
    onComplete
  })
}

export function animateQuizQuestionOut(element, onComplete) {
  if (!element) {
    if (typeof onComplete === 'function') onComplete()
    return
  }

  gsap.killTweensOf(element)

  gsap.to(element, {
    opacity: 0,
    x: -28,
    duration: 0.24,
    ease: 'power2.in',
    overwrite: 'auto',
    onComplete
  })
}

export function animateQuizResultsIn(elements) {
  if (!elements || !elements.length) return

  gsap.killTweensOf(elements)

  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 28,
      scale: 0.97
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.45,
      stagger: 0.12,
      ease: 'power2.out',
      overwrite: 'auto'
    }
  )
}

export function animateQuizDetailIn(element) {
  if (!element) return

  gsap.killTweensOf(element)

  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 20
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
      delay: 0.08
    }
  )
}

export function animateQuizResultSelection(element) {
  if (!element) return

  gsap.killTweensOf(element)

  gsap.fromTo(
    element,
    {
      scale: 0.98
    },
    {
      scale: 1.03,
      duration: 0.16,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      overwrite: 'auto'
    }
  )
}

export function animateQuizResetOut(element, onComplete) {
  if (!element) {
    if (typeof onComplete === 'function') onComplete()
    return
  }

  gsap.killTweensOf(element)

  gsap.to(element, {
    opacity: 0,
    y: 18,
    duration: 0.22,
    ease: 'power2.in',
    overwrite: 'auto',
    onComplete
  })
}