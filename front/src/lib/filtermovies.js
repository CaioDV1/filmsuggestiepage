/* dit bestand bevat alle functies die nodig zijn om de films te filteren en sorteren op basis van de gebruikersvoorkeuren in de quiz en de zoekfunctie,
zoals filteren op genre, periode, runtime en sorteren op titel of jaar, deze functies worden gebruikt in de quiz en de film lijst componenten */

export const QUIZ_GENRE_MAP = {
  action: [
    'action film',
    'action comedy film',
    'action thriller',
    'action-adventure film',
    'adventure film',
    'epic film',
    'war film',
    'crime film',
    'gangster film',
    'heist film',
    'martial arts film',
    'road movie',
    'superhero film',
    'swashbuckler film',
    'western film'
  ],
  comedy: [
    'comedy film',
    'comedy drama',
    'romantic comedy',
    'satire',
    'parody film',
    'buddy film',
    'family film',
    'teen film',
    'animated film',
    'animation',
    'musical film'
  ],
  romance: [
    'romance film',
    'romantic drama',
    'romantic comedy',
    'drama film',
    'coming-of-age film',
    'melodrama'
  ],
  dark: [
    'thriller film',
    'psychological thriller',
    'psychological drama',
    'psychological horror',
    'horror film',
    'slasher film',
    'mystery film',
    'crime thriller',
    'neo-noir',
    'film noir',
    'prison film',
    'detective film'
  ],
  fantasy: [
    'science fiction film',
    'fantasy film',
    'adventure film',
    'space opera',
    'dystopian film',
    'post-apocalyptic film',
    'monster film',
    'superhero film',
    'animated film',
    'epic film'
  ]
}

export function searchMovies(movies, searchTerm) {
  const term = (searchTerm || '').trim().toLowerCase()

  if (!term) {
    return movies
  }

  return movies.filter((movie) => movie.title.toLowerCase().includes(term))
}

export function filterMoviesByGenre(movies, genre) {
  if (!genre) {
    return movies
  }

  return movies.filter((movie) => {
    const genres = movie.genres || []
    return genres.some((item) => item.toLowerCase() === genre.toLowerCase())
  })
}

export function sortMovies(movies, sortValue) {
  const sorted = [...movies]

  switch (sortValue) {
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'year-asc':
      return sorted.sort((a, b) => (a.year || 0) - (b.year || 0))
    case 'year-desc':
      return sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
    default:
      return sorted
  }
}

export function getAvailableGenres(movies) {
  const allGenres = movies.flatMap((movie) => movie.genres || [])
  return [...new Set(allGenres)].sort((a, b) => a.localeCompare(b))
}

export function applyMovieFilters(
  movies,
  { searchTerm = '', genre = '', sort = '' }
) {
  let result = [...movies]

  result = searchMovies(result, searchTerm)
  result = filterMoviesByGenre(result, genre)
  result = sortMovies(result, sort)

  return result
}

export function filterMoviesByQuizGenre(movies, quizGenre) {
  if (!quizGenre || !QUIZ_GENRE_MAP[quizGenre]) {
    return movies
  }

  const wantedGenres = QUIZ_GENRE_MAP[quizGenre]

  return movies.filter((movie) => {
    const genres = (movie.genres || []).map((genre) => genre.toLowerCase())

    return wantedGenres.some((wantedGenre) =>
      genres.some((genre) => genre.includes(wantedGenre))
    )
  })
}

export function filterMoviesByPeriod(movies, period) {
  if (!period || period === 'any') {
    return movies
  }

  return movies.filter((movie) => {
    const year = Number(movie.year) || 0

    if (!year) return false
    if (period === 'modern') return year >= 2000
    if (period === 'classic') return year < 2000

    return true
  })
}

export function filterMoviesByRuntime(movies, timeChoice) {
  if (!timeChoice) {
    return movies
  }

  return movies.filter((movie) => {
    const runtime = Number(movie.runtimeMinutes) || 0

    if (!runtime) return false
    if (timeChoice === 'short') return runtime < 110
    if (timeChoice === 'medium') return runtime >= 110 && runtime <= 135
    if (timeChoice === 'long') return runtime > 135

    return true
  })
}

export function shuffleMovies(movies) {
  const shuffled = [...movies]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i]
    ]
  }

  return shuffled
}