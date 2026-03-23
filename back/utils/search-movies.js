/* dit bestand bevat de functies die nodig zijn om films te zoeken op basis van een titel, deze functies maken gebruik van de Wikidata SPARQL endpoint
  om films te zoeken die overeenkomen met de opgegeven titel, en de resultaten worden gefilterd en teruggegeven in een consistent formaat, deze functies
  worden gebruikt in de Wikidata router om de zoekfunctionaliteit voor films te implementeren in de API endpoint */

function uniqueByQid(items) {
  const seen = new Set()

  return items.filter((item) => {
    if (!item.wikidataId || seen.has(item.wikidataId)) {
      return false
    }

    seen.add(item.wikidataId)
    return true
  })
}

function getQidFromUri(uri) {
  if (!uri) return ''

  const parts = uri.split('/')
  return parts[parts.length - 1] || ''
}

export async function searchMoviesByTitle(title) {
  const cleanedTitle = String(title || '').trim()

  if (!cleanedTitle) {
    return []
  }

  const query = `
    SELECT ?movie ?title WHERE {
      ?movie wdt:P31 wd:Q11424.
      ?movie wdt:P1476 ?title.
      FILTER(CONTAINS(LCASE(?title), "${cleanedTitle.toLowerCase()}"))
    }
    LIMIT 5
  `

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'FilmSuggestiePage/1.0'
    }
  })

  if (!response.ok) {
    throw new Error('Kon geen filmzoekresultaten ophalen van Wikidata.')
  }

  const json = await response.json()
  const bindings = json?.results?.bindings || []

  const movies = bindings.map((item) => ({
    title: item.title?.value || '',
    wikidataId: getQidFromUri(item.movie?.value),
    imdbId: ''
  }))

  return uniqueByQid(movies)
}