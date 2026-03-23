/* dit bestand bevat de functies die nodig zijn om de films in het archief te verrijken met details uit Wikidata,
 zoals het ophalen van de details van een film op basis van een QID, en het samenvoegen van de details uit Wikidata
  met de bestaande details van de film in het archief, deze functies worden gebruikt in de Wikidata router en in de
   archive API functies om ervoor te zorgen dat de films in het archief zo compleet mogelijk zijn met behulp van
    de gegevens uit Wikidata */

import { fetchManyWikidataFilmDetails } from './wikidata.js'

function mergeMovieWithWikidata(movie, wikidata) {
  return {
    ...movie,
    wikidataTitle: wikidata.title || movie.wikidataTitle || null,
    year: movie.year || wikidata.year || null,
    directors: movie.directors?.length ? movie.directors : wikidata.directors || [],
    genres: movie.genres?.length ? movie.genres : wikidata.genres || [],
    cast: movie.cast?.length ? movie.cast : wikidata.cast || [],
    runtimeMinutes: movie.runtimeMinutes || wikidata.runtimeMinutes || null,
    languages: movie.languages?.length ? movie.languages : wikidata.languages || [],
    countries: movie.countries?.length ? movie.countries : wikidata.countries || []
  }
}

function hasUsefulMovieDetails(movie) {
  return (
    Array.isArray(movie?.genres) && movie.genres.length > 0 &&
    Number(movie?.year)
  )
}

export async function enrichArchiveMoviesAndPersist(filmsDetailsStore) {
  const movies = await filmsDetailsStore.read()

  if (!Array.isArray(movies) || !movies.length) {
    return []
  }

  const qidsToFetch = [
    ...new Set(
      movies
        .filter((movie) => movie?.wikidataId && !hasUsefulMovieDetails(movie))
        .map((movie) => movie.wikidataId)
    )
  ]

  if (!qidsToFetch.length) {
    return movies
  }

  const wikidataMap = await fetchManyWikidataFilmDetails(qidsToFetch)

  const enrichedMovies = movies.map((movie) => {
    if (!movie?.wikidataId) {
      return movie
    }

    const wikidata = wikidataMap[movie.wikidataId]

    if (!wikidata) {
      return movie
    }

    return mergeMovieWithWikidata(movie, wikidata)
  })

  await filmsDetailsStore.write(enrichedMovies)
  return enrichedMovies
}