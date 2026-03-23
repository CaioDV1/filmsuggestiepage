/* de service worker van de front end, zorgt voor de 
caching en PWA-gedrag zodat de dele vand e site sneller
of offline kunnen werken */


const CACHE_NAME = 'film-suggesties-v1'
const urlsToCache = ['/', '/index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})