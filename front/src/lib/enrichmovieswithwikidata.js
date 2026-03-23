/* dit bestand bevat de functie die de films verrijkt met data uit Wikidata,
zoals: regisseur, acteurs en genres, deze functie wordt aangeroepen nadat de films zijn opgehaald uit de backend,
om ervoor te zorgen dat we zo veel mogelijk informatie hebben om weer te geven in de film details en quiz */

import { postJson } from './api-opvragingen.js'

export async function enrichMoviesWithWikidata(movies) {
  if (!Array.isArray(movies) || !movies.length) {
    return []
  }

  return postJson(
    '/enrich-movies',
    { movies },
    'Kon films niet verrijken via de backend.'
  )
}