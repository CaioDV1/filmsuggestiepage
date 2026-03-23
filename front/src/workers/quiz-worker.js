/* dit bestand is de web worker die de quiz resultaten berekent op basis van de antwoorden van 
de gebruiker in de quiz, deze worker wordt gebruikt om de quiz resultaten te berekenen zonder 
de hoofdthread te blokkeren, zodat de gebruikersinterface soepel blijft tijdens het berekenen 
van de resultaten */

import { getQuizResults } from '../lib/quiz-resultaten.js'

self.onmessage = (event) => {
  const { items, answers } = event.data
  const results = getQuizResults(items, answers)
  self.postMessage(results)
}