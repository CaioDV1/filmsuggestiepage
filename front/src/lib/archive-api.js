/* dit bestand bevat alle functies die nodig zijn om te communiceren met de backend API, 
zoals GET en POST verzoeken, en error handling */

import { getJson, postJson } from './api-opvragingen.js'

export function fetchArchiveMovies() {
  return getJson('/archive/movies', 'Kon archieffilms niet ophalen.')
}

export function addMovieToArchive(movie) {
  return postJson(
    '/archive/add-movie',
    movie,
    'Kon film niet toevoegen aan het archief.'
  )
}

export function searchMovies(title) {
  return getJson(
    `/search-movies?title=${encodeURIComponent(title)}`,
    'Kon geen films zoeken via de backend.'
  )
}