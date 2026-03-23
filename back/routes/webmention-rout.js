/* dit bestand bevat de router voor de webmention gerelateerde API endpoints, zoals het ophalen van alle webmentions,
 en het toevoegen van een nieuwe webmention, deze router wordt gebruikt in de main server file om de API endpoints te 
 definiëren en te koppelen aan de juiste functies in de utils map */


import express from 'express'

export function createWebmentionRouter({ webmentionsStore }) {
  const router = express.Router()

  router.get('/webmention', async (_req, res) => {
    try {
      const webmentions = await webmentionsStore.read()
      res.json(webmentions)
    } catch (error) {
      console.error('Fout bij ophalen van webmentions:', error)
      res.status(500).json({
        error: 'Kon webmentions niet ophalen'
      })
    }
  })

  router.post('/webmention', async (req, res) => {
    try {
      const { source, target } = req.body

      if (!source || !target) {
        return res.status(400).json({
          error: 'source en target zijn verplicht'
        })
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
      res.status(500).json({
        error: 'Kon webmention niet opslaan'
      })
    }
  })

  return router
}