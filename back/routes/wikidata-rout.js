/* dit bestand bevat de router voor de Wikidata gerelateerde API endpoints, zoals het ophalen van de details van een film op basis van een QID,
  en het verrijken van een lijst van films met de details uit Wikidata, deze router wordt gebruikt in de main server file om de API endpoints te definiëren
    en te koppelen aan de juiste functies in de utils map */

import express from 'express'
import {
  fetchManyWikidataFilmDetails,
  fetchWikidataFilmDetails
} from '../utils/wikidata.js'
import { enrichArchiveMoviesAndPersist } from '../utils/enricht-archive.js'

const EMPTY_WIKIDATA_DETAILS = {
  wikidataTitle: null,
  year: null,
  directors: [],
  genres: [],
  cast: [],
  runtimeMinutes: null,
  languages: [],
  countries: []
}

export function createWikidataRouter({ filmsDetailsStore } = {}) {
  const router = express.Router()

  router.get('/api/wikidata/:qid', async (req, res) => {
    try {
      const { qid } = req.params

      if (!qid) {
        return res.status(400).json({ error: 'Geen QID meegegeven.' })
      }

      const data = await fetchWikidataFilmDetails(qid)
      res.json(data)
    } catch (error) {
      console.error('Fout bij ophalen van Wikidata details:', error)
      res.status(500).json({ error: 'Kon Wikidata details niet ophalen.' })
    }
  })

  router.post('/api/enrich-movies', async (req, res) => {
    try {
      const movies = Array.isArray(req.body) ? req.body : req.body.movies

      if (!Array.isArray(movies)) {
        return res
          .status(400)
          .json({ error: 'Geen geldige filmlijst ontvangen.' })
      }

      const qids = [
        ...new Set(movies.map((movie) => movie?.wikidataId).filter(Boolean))
      ]
      const wikidataMap = await fetchManyWikidataFilmDetails(qids)

      const enrichedMovies = movies.map((movie) => {
        if (!movie?.wikidataId) {
          return {
            ...movie,
            ...EMPTY_WIKIDATA_DETAILS,
            wikidataTitle: movie.wikidataTitle || null,
            year: movie.year || null,
            directors: movie.directors || [],
            genres: movie.genres || [],
            cast: movie.cast || [],
            runtimeMinutes: movie.runtimeMinutes || null,
            languages: movie.languages || [],
            countries: movie.countries || []
          }
        }

        const wikidata = wikidataMap[movie.wikidataId] || {}

        return {
          ...movie,
          wikidataTitle: wikidata.title || movie.wikidataTitle || null,
          year: movie.year || wikidata.year || null,
          directors: movie.directors?.length
            ? movie.directors
            : wikidata.directors || [],
          genres: movie.genres?.length ? movie.genres : wikidata.genres || [],
          cast: movie.cast?.length ? movie.cast : wikidata.cast || [],
          runtimeMinutes:
            movie.runtimeMinutes || wikidata.runtimeMinutes || null,
          languages: movie.languages?.length
            ? movie.languages
            : wikidata.languages || [],
          countries: movie.countries?.length
            ? movie.countries
            : wikidata.countries || []
        }
      })

      if (filmsDetailsStore) {
        await enrichArchiveMoviesAndPersist(filmsDetailsStore)
      }

      res.json(enrichedMovies)
    } catch (error) {
      console.error('Fout bij verrijken van films:', error)
      res.status(500).json({ error: 'Kon films niet verrijken.' })
    }
  })

  return router
}