/* dit bestand bevat de functie die de films uit de backend en de films uit Wikidata samenvoegt tot één lijst van films met
 alle beschikbare informatie, zoals: titel, jaar, regisseur, acteurs, genres, beschrijving en afbeelding, deze functie wordt
  aangeroepen nadat de films zijn opgehaald uit de backend en verrijkt zijn met data uit Wikidata */

export function normalizeMovieTitle(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—:'.!,?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function mergeMovies(localMovies, detailMovies) {
  const localMap = new Map(
    localMovies.map((movie) => [normalizeMovieTitle(movie.title), movie])
  )

  return detailMovies.map((detailMovie) => {
    const localMatch = localMap.get(normalizeMovieTitle(detailMovie.title))

    return {
      ...detailMovie,
      image: localMatch?.image || null,
      description: localMatch?.description || '',
      likes: localMatch?.likes || 0,
      comments: localMatch?.comments || []
    }
  })
}