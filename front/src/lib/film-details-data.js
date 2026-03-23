/* dit bestand bevat de functies die nodig zijn om de film details te bepalen,
 */

export function hasEnoughDetailData(film) {
  return Boolean(
    film.year ||
      film.directors?.length ||
      film.genres?.length ||
      film.runtimeMinutes ||
      film.languages?.length ||
      film.countries?.length ||
      film.cast?.length
  )
}

export function buildDetailData(film, wikidata = {}) {
  return {
    title: film.wikidataTitle || wikidata.title || film.title || null,
    year: film.year || wikidata.year || null,
    directors: film.directors?.length ? film.directors : wikidata.directors || [],
    genres: film.genres?.length ? film.genres : wikidata.genres || [],
    cast: film.cast?.length ? film.cast : wikidata.cast || [],
    runtimeMinutes: film.runtimeMinutes || wikidata.runtimeMinutes || null,
    languages: film.languages?.length ? film.languages : wikidata.languages || [],
    countries: film.countries?.length ? film.countries : wikidata.countries || []
  }
}