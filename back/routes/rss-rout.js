/* dit bestand bevat de router voor de RSS feed endpoint, die de RSS feed genereert voor de film van de maand, deze router
  wordt gebruikt in de main server file om de API endpoint te definiëren en te koppelen aan de functie die de RSS feed
   genereert in de utils map */

import express from 'express'
import { buildMovieOfTheMonthRss } from '../utils/rss.js'

export function createRssRouter({ filmsDetailsStore, siteUrl }) {
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

  return router
}