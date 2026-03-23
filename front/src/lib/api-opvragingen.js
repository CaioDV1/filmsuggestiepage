/* dit bestand bevat alle functies die nodig zijn om te communiceren met de backend API, 
zoals GET en POST verzoeken, en error handling */

const API_BASE_URL = 'https://backendfilmsuggestiepage.onrender.com/api'
function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

async function getJsonOrError(response, fallbackMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage)
  }

  return data
}

export async function getJson(path, fallbackMessage) {
  const response = await fetch(buildApiUrl(path))
  return getJsonOrError(response, fallbackMessage)
}

export async function postJson(path, body, fallbackMessage) {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  return getJsonOrError(response, fallbackMessage)
}