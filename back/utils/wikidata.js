/* dit bestand bevat de functies die nodig zijn om details van films op te halen uit Wikidata,
 zoals de titel, het jaar van uitgave, de regisseur, het genre, de cast, de taal en het land van 
 productie, deze functies maken gebruik van de Wikidata SPARQL endpoint om de gegevens op te halen
  en worden gecached in een JSON bestand om onnodige verzoeken te voorkomen en de prestaties te 
  verbeteren, deze functies worden gebruikt in de Wikidata router om ervoor te zorgen dat de API 
  endpoints snel en efficiënt kunnen reageren met de details van films uit Wikidata */
const BATCH_SIZE = 20

function createEmptyMovieDetails() {
  return {
    title: null,
    year: null,
    runtimeMinutes: null,
    directors: [],
    genres: [],
    cast: [],
    languages: [],
    countries: []
  }
}

function getQidFromUri(uri) {
  if (!uri) return null

  const parts = uri.split('/')
  return parts[parts.length - 1] || null
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))]
}

async function runSparqlQuery(query) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: 'application/sparql-results+json',
          'User-Agent': 'FilmSuggestiePage/1.0'
        },
        signal: controller.signal
      }
    )

    if (!response.ok) {
      throw new Error(`Wikidata gaf status ${response.status}`)
    }

    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchBatch(qids) {
  if (!qids.length) return {}

  const values = qids.map((qid) => `wd:${qid}`).join(' ')

  const query = `
    SELECT ?film ?filmLabel ?releaseDate ?runtime ?directorLabel ?genreLabel ?castLabel ?languageLabel ?countryLabel WHERE {
      VALUES ?film { ${values} }

      OPTIONAL { ?film wdt:P577 ?releaseDate. }
      OPTIONAL { ?film wdt:P2047 ?runtime. }
      OPTIONAL { ?film wdt:P57 ?director. }
      OPTIONAL { ?film wdt:P136 ?genre. }
      OPTIONAL { ?film wdt:P161 ?cast. }
      OPTIONAL { ?film wdt:P364 ?language. }
      OPTIONAL { ?film wdt:P495 ?country. }

      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
  `

  const json = await runSparqlQuery(query)
  const bindings = json?.results?.bindings || []

  const grouped = {}

  qids.forEach((qid) => {
    grouped[qid] = createEmptyMovieDetails()
  })

  bindings.forEach((row) => {
    const qid = getQidFromUri(row.film?.value)

    if (!qid || !grouped[qid]) return

    if (!grouped[qid].title && row.filmLabel?.value) {
      grouped[qid].title = row.filmLabel.value
    }

    if (!grouped[qid].year && row.releaseDate?.value) {
      grouped[qid].year = new Date(row.releaseDate.value).getFullYear()
    }

    if (!grouped[qid].runtimeMinutes && row.runtime?.value) {
      grouped[qid].runtimeMinutes = Math.round(Number(row.runtime.value))
    }

    if (row.directorLabel?.value) grouped[qid].directors.push(row.directorLabel.value)
    if (row.genreLabel?.value) grouped[qid].genres.push(row.genreLabel.value)
    if (row.castLabel?.value) grouped[qid].cast.push(row.castLabel.value)
    if (row.languageLabel?.value) grouped[qid].languages.push(row.languageLabel.value)
    if (row.countryLabel?.value) grouped[qid].countries.push(row.countryLabel.value)
  })

  Object.values(grouped).forEach((movie) => {
    movie.directors = uniqueList(movie.directors)
    movie.genres = uniqueList(movie.genres)
    movie.cast = uniqueList(movie.cast)
    movie.languages = uniqueList(movie.languages)
    movie.countries = uniqueList(movie.countries)
  })

  return grouped
}

export async function fetchManyWikidataFilmDetails(qids) {
  const result = {}
  const cleanQids = [...new Set((qids || []).filter(Boolean))]

  for (let i = 0; i < cleanQids.length; i += BATCH_SIZE) {
    const chunk = cleanQids.slice(i, i + BATCH_SIZE)

    try {
      const batchData = await fetchBatch(chunk)

      chunk.forEach((qid) => {
        result[qid] = batchData[qid] || createEmptyMovieDetails()
      })
    } catch (error) {
      console.error('Wikidata batch mislukt voor chunk:', chunk, error)

      chunk.forEach((qid) => {
        result[qid] = createEmptyMovieDetails()
      })
    }
  }

  return result
}

export async function fetchWikidataFilmDetails(qid) {
  if (!qid) return {}

  const all = await fetchManyWikidataFilmDetails([qid])
  return all[qid] || {}
}