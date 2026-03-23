/* dit bestand bevat de functies die nodig zijn om de RSS feed te genereren voor de film van de maand, zoals het escapen van XML tekens
  en het bouwen van de RSS feed XML string, deze functies worden gebruikt in de RSS router om ervoor te zorgen dat de RSS feed correct
  wordt gegenereerd en geldig is, zodat deze kan worden gebruikt door RSS readers en andere toepassingen die de feed willen gebruiken */

export function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildMovieOfTheMonthRss(movie, siteUrl) {
  const title = escapeXml(movie?.title || 'Onbekende film')
  const qid = escapeXml(movie?.wikidataId || '')
  const link = `${siteUrl}/?film=${qid}`
  const pubDate = new Date().toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Film van de maand - Film Suggesties</title>
    <description>Een eenvoudige RSS-feed met onze film van de maand.</description>
    <link>${siteUrl}</link>
    <language>nl-be</language>
    <item>
      <title>Film van de maand: ${title}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>
  </channel>
</rss>`
}