const API_BASE_URL = '/api'

function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

async function readResponse(response, fallbackMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage)
  }

  return data
}

export async function apiGet(path, fallbackMessage = 'Er ging iets mis.') {
  const response = await fetch(apiUrl(path))
  return readResponse(response, fallbackMessage)
}

export async function apiPost(path, body, fallbackMessage = 'Er ging iets mis.') {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  return readResponse(response, fallbackMessage)
}

export function getFilmQid(film) {
  return film?.wikidataId || ''
}

export function fetchArchiveMovies() {
  return apiGet('/archive/movies', 'Kon archieffilms niet ophalen.')
}

export function addMovieToArchive(movie) {
  return apiPost('/archive/add-movie', movie, 'Kon film niet toevoegen aan het archief.')
}

export function searchMovies(title) {
  return apiGet(`/search-movies?title=${encodeURIComponent(title)}`, 'Kon geen films zoeken via de backend.')
}

export function fetchCommentsByQid(qid) {
  return apiGet(`/comments/${qid}`, 'Kon comments niet ophalen.')
}

export function postCommentByQid(qid, commentData) {
  return apiPost(`/comments/${qid}`, commentData, 'Kon comment niet opslaan.')
}

export function enrichMoviesWithWikidata(movies) {
  if (!Array.isArray(movies) || !movies.length) {
    return Promise.resolve([])
  }

  return apiPost('/enrich-movies', { movies }, 'Kon films niet verrijken via de backend.')
}

export function fetchWikidataFilmDetails(qid) {
  if (!qid) {
    return Promise.resolve({})
  }

  return apiGet(`/wikidata/${qid}`, 'Kon filmdetails niet ophalen via de backend.')
}