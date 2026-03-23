/* dit bestand bevat de router voor de archief gerelateerde API endpoints, zoals het ophalen van de films
 in het archief, het toevoegen van een film aan het archief, en het zoeken naar films op titel, deze router
  wordt gebruikt in de main server file om de API endpoints te definiëren en te koppelen aan de juiste
   functies in de utils map */

import express from 'express'
import {
  archiveContainsMovie,
  normalizeArchiveMovie
} from '../utils/archive.js'
import { searchMoviesByTitle } from '../utils/search-movies.js'
import { enrichArchiveMoviesAndPersist } from '../utils/enricht-archive.js'

export function createArchiveRouter({ filmsDetailsStore }) {
  const router = express.Router()

  router.get('/api/archive/movies', async (_req, res) => {
    try {
      const enrichedMovies = await enrichArchiveMoviesAndPersist(filmsDetailsStore)
      res.json(enrichedMovies)
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
        return res.status(400).json({
          error: 'title en wikidataId zijn verplicht.'
        })
      }

      if (archiveContainsMovie(movies, incomingMovie)) {
        return res.status(200).json({
          added: false,
          message: 'Film bestaat al in het archief.',
          movie: incomingMovie
        })
      }

      const updatedMovies = [...movies, incomingMovie]
      await filmsDetailsStore.write(updatedMovies)

      const enrichedMovies = await enrichArchiveMoviesAndPersist(filmsDetailsStore)
      const savedMovie =
        enrichedMovies.find(
          (movie) => movie.wikidataId === incomingMovie.wikidataId
        ) || incomingMovie

      res.status(201).json({
        added: true,
        message: 'Film toegevoegd aan het archief.',
        movie: savedMovie
      })
    } catch (error) {
      console.error('Fout bij toevoegen aan archief:', error)
      res.status(500).json({
        error: 'Kon film niet toevoegen aan het archief.'
      })
    }
  })

  router.get('/api/search-movies', async (req, res) => {
    try {
      const title = String(req.query.title || '').trim()

      if (!title) {
        return res.status(400).json({ error: 'Geen zoektitel meegegeven.' })
      }

      const results = await searchMoviesByTitle(title)
      res.json(results)
    } catch (error) {
      console.error('Fout bij zoeken naar films:', error)
      res.status(500).json({ error: 'Kon geen films zoeken.' })
    }
  })

  return router
}