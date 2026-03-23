/* dit bestand bevat alle functies die nodig zijn om de likes van films op te slaan in de localStorage,
 zodat gebruikers hun likes kunnen behouden bij het vernieuwen van de pagina of het sluiten van de browser
 , deze functies worden gebruikt in de film details component en de film lijst component om de likes weer
  te geven en bij te werken */

export function getFilmStorageId(film) {
  return film.imdbId || film.wikidataId || film.title
}

export function getLikesMap() {
  try {
    const raw = localStorage.getItem('film-likes')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveLikesMap(likesMap) {
  try {
    localStorage.setItem('film-likes', JSON.stringify(likesMap))
  } catch {}
}

export function getStoredLikes(film) {
  const filmId = getFilmStorageId(film)
  const likesMap = getLikesMap()
  return Number(likesMap[filmId] || film.likes || 0)
}

export function saveStoredLikes(film, likes) {
  const filmId = getFilmStorageId(film)
  const likesMap = getLikesMap()
  likesMap[filmId] = likes
  saveLikesMap(likesMap)
}