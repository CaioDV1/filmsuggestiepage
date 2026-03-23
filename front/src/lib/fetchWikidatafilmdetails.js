/* dit bestand bevat de functie die de film details ophaalt uit Wikidata, 
deze functie wordt aangeroepen wanneer een gebruiker op een film, om de details van die film weer te geven in het detailscherm */

import { getJson } from './api-opvragingen.js'

export async function fetchWikidataFilmDetails(qid) {
  if (!qid) return {}
  return getJson(`/wikidata/${qid}`, 'Kon filmdetails niet ophalen via de backend.')
}