/* dit is de main server file van de backend, hier worden alle routers geïmporteerd en gebruikt om de API endpoints te definiëren,
  en wordt de WebSocket server opgezet om real-time communicatie mogelijk te maken tussen clients die dezelfde film bekijken, deze file
  is het startpunt van de backend en zorgt ervoor dat alle functionaliteiten van de API beschikbaar zijn en correct werken */


import cors from 'cors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'

import { createJsonStore } from './utils/json-opslag.js'
import { createApiRouter } from './routes/api.js'

const SITE_URL = "https://frontendfilmsuggestiepage.onrender.com"
const PORT = process.env.PORT || 3001
const HOST = "0.0.0.0"  
const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const commentsStore = createJsonStore(path.join(__dirname, 'data', 'movie-comments.json'), {})
const filmsDetailsStore = createJsonStore(path.join(__dirname, 'data', 'films-details.json'), [])
const webmentionsStore = createJsonStore(path.join(__dirname, 'data', 'webmentions.json'), [])

app.use(cors())
app.use(express.json())
app.use(createApiRouter({ commentsStore, filmsDetailsStore, webmentionsStore, siteUrl: SITE_URL }))

const httpServer = createServer(app)
const wss = new WebSocketServer({ server: httpServer })
const users = new Map()

function sendJson(ws, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload))
  }
}

function broadcastUsers(qid) {
  const filmUsers = Array.from(users.values())
    .filter((user) => user.qid === qid)
    .map((user) => user.sender)

  wss.clients.forEach((client) => {
    const userData = users.get(client)
    if (!userData || userData.qid !== qid) return

    sendJson(client, {
      type: 'users',
      qid,
      users: filmUsers
    })
  })
}

function broadcastMessage(qid, payload) {
  wss.clients.forEach((client) => {
    const userData = users.get(client)
    if (!userData || userData.qid !== qid) return
    sendJson(client, payload)
  })
}

wss.on('connection', (ws) => {
  console.log('WebSocket client verbonden')

  ws.on('message', (rawMessage) => {
    try {
      const parsed = JSON.parse(rawMessage.toString())
      const qid = String(parsed.qid || '').trim()
      const sender = String(parsed.sender || 'anon').trim() || 'anon'

      if (!qid) return

      users.set(ws, { qid, sender })

      if (parsed.type === 'join') {
        broadcastUsers(qid)
        return
      }

      if (parsed.type === 'message') {
        broadcastMessage(qid, {
          type: 'message',
          qid,
          sender,
          text: String(parsed.text || ''),
          stars: Number(parsed.stars || 0)
        })
      }
    } catch (error) {
      console.error('Fout bij websocket message:', error)
    }
  })

  ws.on('close', () => {
    const userData = users.get(ws)

    if (userData) {
      users.delete(ws)
      broadcastUsers(userData.qid)
    }

    console.log('WebSocket client verbroken')
  })

  ws.on('error', (error) => {
    console.error('WebSocket fout:', error)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Backend draait op http://${HOST}:${PORT}`)
})