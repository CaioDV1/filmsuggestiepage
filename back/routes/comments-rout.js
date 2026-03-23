/* dit bestand bevat de router voor de comments gerelateerde API endpoints, zoals het ophalen van de comments
  voor een film, en het toevoegen van een comment aan een film, deze router wordt gebruikt in de main server file
    om de API endpoints te definiëren en te koppelen aan de juiste functies in de utils map */

import express from 'express'
import { getAverageStars } from '../utils/film-stats.js'

export function createCommentsRouter({ commentsStore }) {
  const router = express.Router()

  router.get('/api/comments/:qid', async (req, res) => {
    try {
      const { qid } = req.params
      const data = await commentsStore.read()

      const entry = data[qid] || {
        commentCount: 0,
        comments: [],
        averageStars: 0
      }
      const comments = Array.isArray(entry.comments) ? entry.comments : []

      res.json({
        commentCount: entry.commentCount ?? comments.length,
        averageStars:
          typeof entry.averageStars === 'number'
            ? entry.averageStars
            : getAverageStars(comments),
        comments
      })
    } catch (error) {
      console.error('Fout bij ophalen van comments:', error)
      res.status(500).json({ error: 'Kon comments niet ophalen.' })
    }
  })

  router.post('/api/comments/:qid', async (req, res) => {
    try {
      const { qid } = req.params
      const user = String(req.body.user || '').trim()
      const text = String(req.body.text || '').trim()
      const stars = Number(req.body.stars)

      if (!user || !text || !stars) {
        return res.status(400).json({
          error: 'user, text en stars zijn verplicht'
        })
      }

      const data = await commentsStore.read()

      if (!data[qid]) {
        data[qid] = {
          commentCount: 0,
          comments: [],
          averageStars: 0
        }
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
      res.status(500).json({
        error: 'Kon comment niet opslaan.'
      })
    }
  })

  return router
}