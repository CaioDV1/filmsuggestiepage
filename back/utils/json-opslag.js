/* dit bestand bevat de functies die nodig zijn om te werken met JSON bestanden, zoals het lezen en schrijven van JSON bestanden,
  deze functies worden gebruikt in de archive router en in de archive API functies om ervoor te zorgen dat de films in het
  archief correct worden opgeslagen en gelezen uit JSON bestanden, en ook in de webmention router om de webmentions op te slaan
  in een JSON bestand, deze functies maken gebruik van de fs module van Node.js om te werken met bestanden en mappen */

import fs from 'fs/promises'

export async function readJsonFile(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function createJsonStore(filePath, fallback) {
  return {
    read() {
      return readJsonFile(filePath, fallback)
    },
    write(data) {
      return writeJsonFile(filePath, data)
    }
  }
}