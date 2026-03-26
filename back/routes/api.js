import express from 'express'
import { buildMovieOfTheMonthRss } from '../utils/rss.js'
import {
  fetchManyWikidataFilmDetails,
  fetchWikidataFilmDetails
} from '../utils/wikidata.js'

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizeArchiveMovie(movie) {
  return {
    title: String(movie?.title || '').trim(),
    wikidataId: String(movie?.wikidataId || '').trim(),
    imdbId: movie?.imdbId ? String(movie.imdbId).trim() : ''
  }
}

function getAverageStars(comments = []) {
  let total = 0

  for (const comment of comments) {
    total += Number(comment.stars) || 0
  }

  return comments.length ? total / comments.length : 0
}

function hasUsefulMovieDetails(movie) {
  return Array.isArray(movie?.genres) && movie.genres.length > 0 && Number(movie?.year)
}

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

async function enrichArchiveMoviesAndPersist(filmsDetailsStore) {
  const movies = await filmsDetailsStore.read()

  if (!Array.isArray(movies) || !movies.length) {
    return []
  }

  const qidsToFetch = [...new Set(
    movies
      .filter((movie) => movie?.wikidataId && !hasUsefulMovieDetails(movie))
      .map((movie) => movie.wikidataId)
  )]

  if (!qidsToFetch.length) {
    return movies
  }

  const wikidataMap = await fetchManyWikidataFilmDetails(qidsToFetch)

  const enrichedMovies = movies.map((movie) => {
    if (!movie?.wikidataId || !wikidataMap[movie.wikidataId]) {
      return movie
    }

    return mergeMovieWithWikidata(movie, wikidataMap[movie.wikidataId])
  })

  await filmsDetailsStore.write(enrichedMovies)
  return enrichedMovies
}

async function searchMoviesByTitle(title) {
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
  const seen = new Set()

  return bindings
    .map((item) => ({
      title: item.title?.value || '',
      wikidataId: item.movie?.value?.split('/').pop() || '',
      imdbId: ''
    }))
    .filter((item) => {
      if (!item.wikidataId || seen.has(item.wikidataId)) return false
      seen.add(item.wikidataId)
      return true
    })
}

export function createApiRouter({ commentsStore, filmsDetailsStore, webmentionsStore, siteUrl }) {
  const router = express.Router()

  router.get('/rss.xml', async (_req, res) => {
    try {
      const movies = await filmsDetailsStore.read()
      const movieOfTheMonth = movies[0]
      const rssXml = buildMovieOfTheMonthRss(movieOfTheMonth, siteUrl)
      res.set('Content-Type', 'application/rss+xml; charset=utf-8')
      res.send(rssXml)
    } catch (error) {
      console.error('Fout bij genereren van RSS feed:', error)
      res.status(500).send('Kon RSS feed niet genereren.')
    }
  })

  router.get('/api/wikidata/:qid', async (req, res) => {
    try {
      const qid = String(req.params.qid || '').trim()
      if (!qid) return res.status(400).json({ error: 'Geen QID meegegeven.' })
      res.json(await fetchWikidataFilmDetails(qid))
    } catch (error) {
      console.error('Fout bij ophalen van Wikidata details:', error)
      res.status(500).json({ error: 'Kon Wikidata details niet ophalen.' })
    }
  })

  router.post('/api/enrich-movies', async (req, res) => {
    try {
      const movies = Array.isArray(req.body) ? req.body : req.body.movies

      if (!Array.isArray(movies)) {
        return res.status(400).json({ error: 'Geen geldige filmlijst ontvangen.' })
      }

      const qids = [...new Set(movies.map((movie) => movie?.wikidataId).filter(Boolean))]
      const wikidataMap = await fetchManyWikidataFilmDetails(qids)

      const enrichedMovies = movies.map((movie) => {
        if (!movie?.wikidataId) {
          return mergeMovieWithWikidata(movie || {}, {})
        }

        return mergeMovieWithWikidata(movie, wikidataMap[movie.wikidataId] || {})
      })

      await enrichArchiveMoviesAndPersist(filmsDetailsStore)
      res.json(enrichedMovies)
    } catch (error) {
      console.error('Fout bij verrijken van films:', error)
      res.status(500).json({ error: 'Kon films niet verrijken.' })
    }
  })

  router.get('/api/archive/movies', async (_req, res) => {
    try {
      res.json(await enrichArchiveMoviesAndPersist(filmsDetailsStore))
    } catch (error) {
      console.error('Fout bij ophalen van archieffilms:', error)
      res.status(500).json({ error: 'Kon archieffilms niet ophalen.' })
    }
  })

  router.post('/api/archive/add-movie', async (req, res) => {
    try {
      const movies = await filmsDetailsStore.read()
      const incomingMovie = normalizeArchiveMovie(req.body)

      if (!incomingMovie.title || !incomingMovie.wikidataId) {
        return res.status(400).json({ error: 'title en wikidataId zijn verplicht.' })
      }

      const alreadyExists = movies.some((movie) => {
        const sameQid = incomingMovie.wikidataId && movie.wikidataId === incomingMovie.wikidataId
        const sameTitle = normalizeTitle(movie.title) === normalizeTitle(incomingMovie.title)
        return sameQid || sameTitle
      })

      if (alreadyExists) {
        return res.status(200).json({
          added: false,
          message: 'Film bestaat al in het archief.',
          movie: incomingMovie
        })
      }

      const updatedMovies = [...movies, incomingMovie]
      await filmsDetailsStore.write(updatedMovies)
      const enrichedMovies = await enrichArchiveMoviesAndPersist(filmsDetailsStore)
      const savedMovie = enrichedMovies.find((movie) => movie.wikidataId === incomingMovie.wikidataId) || incomingMovie

      res.status(201).json({
        added: true,
        message: 'Film toegevoegd aan het archief.',
        movie: savedMovie
      })
    } catch (error) {
      console.error('Fout bij toevoegen aan archief:', error)
      res.status(500).json({ error: 'Kon film niet toevoegen aan het archief.' })
    }
  })

  router.get('/api/search-movies', async (req, res) => {
    try {
      const title = String(req.query.title || '').trim()
      if (!title) return res.status(400).json({ error: 'Geen zoektitel meegegeven.' })
      res.json(await searchMoviesByTitle(title))
    } catch (error) {
      console.error('Fout bij zoeken naar films:', error)
      res.status(500).json({ error: 'Kon geen films zoeken.' })
    }
  })

  router.get('/api/comments/:qid', async (req, res) => {
    try {
      const qid = req.params.qid
      const data = await commentsStore.read()
      const entry = data[qid] || { commentCount: 0, comments: [], averageStars: 0 }
      const comments = Array.isArray(entry.comments) ? entry.comments : []

      res.json({
        commentCount: entry.commentCount ?? comments.length,
        averageStars: typeof entry.averageStars === 'number' ? entry.averageStars : getAverageStars(comments),
        comments
      })
    } catch (error) {
      console.error('Fout bij ophalen van comments:', error)
      res.status(500).json({ error: 'Kon comments niet ophalen.' })
    }
  })

  router.post('/api/comments/:qid', async (req, res) => {
    try {
      const qid = req.params.qid
      const user = String(req.body.user || '').trim()
      const text = String(req.body.text || '').trim()
      const stars = Number(req.body.stars)

      if (!user || !text || !stars) {
        return res.status(400).json({ error: 'user, text en stars zijn verplicht' })
      }

      const data = await commentsStore.read()

      if (!data[qid]) {
        data[qid] = { commentCount: 0, comments: [], averageStars: 0 }
      }

      const newComment = { user, text, stars }
      data[qid].comments.push(newComment)
      data[qid].commentCount = data[qid].comments.length
      data[qid].averageStars = getAverageStars(data[qid].comments)

      await commentsStore.write(data)

      res.status(201).json({
        message: 'Comment opgeslagen',
        comment: newComment,
        commentCount: data[qid].commentCount,
        averageStars: data[qid].averageStars
      })
    } catch (error) {
      console.error('Fout bij opslaan van comment:', error)
      res.status(500).json({ error: 'Kon comment niet opslaan.' })
    }
  })

  router.get('/webmention', async (_req, res) => {
    try {
      res.json(await webmentionsStore.read())
    } catch (error) {
      console.error('Fout bij ophalen van webmentions:', error)
      res.status(500).json({ error: 'Kon webmentions niet ophalen' })
    }
  })

  router.post('/webmention', async (req, res) => {
    try {
      const { source, target } = req.body

      if (!source || !target) {
        return res.status(400).json({ error: 'source en target zijn verplicht' })
      }

      const webmentions = await webmentionsStore.read()
      const newWebmention = {
        id: Date.now().toString(),
        source,
        target,
        createdAt: new Date().toISOString()
      }

      webmentions.push(newWebmention)
      await webmentionsStore.write(webmentions)

      res.status(201).json({
        message: 'Webmention opgeslagen',
        webmention: newWebmention
      })
    } catch (error) {
      console.error('Fout bij opslaan van webmention:', error)
      res.status(500).json({ error: 'Kon webmention niet opslaan' })
    }
  })

  return router
}