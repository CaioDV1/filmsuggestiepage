/* dit bestand bevat de functies die nodig zijn om te werken met het filmarchief, zoals het controleren of een film 
al in het archief staat, en het normaliseren van de filmgegevens voordat ze aan het archief worden toegevoegd, deze 
functies worden gebruikt in de archive router en in de archive API functies om ervoor te zorgen dat de films in het
 archief consistent en correct worden opgeslagen en gecontroleerd */

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function archiveContainsMovie(movies, movieToCheck) {
  const targetQid = movieToCheck?.wikidataId || ''
  const targetTitle = normalizeTitle(movieToCheck?.title)

  return movies.some((movie) => {
    const sameQid = targetQid && movie.wikidataId === targetQid
    const sameTitle = targetTitle && normalizeTitle(movie.title) === targetTitle

    return sameQid || sameTitle
  })
}

export function normalizeArchiveMovie(movie) {
  return {
    title: String(movie?.title || '').trim(),
    wikidataId: String(movie?.wikidataId || '').trim(),
    imdbId: movie?.imdbId ? String(movie.imdbId).trim() : ''
  }
}