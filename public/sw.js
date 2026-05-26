const CACHE = 'groveai-v4'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/', '/manifest.json']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // _next/static assets are content-hashed - cache first, they never change
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(request, clone))
            return res
          })
      )
    )
    return
  }

  // Navigation and everything else: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(request, clone))
        return res
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/')))
  )
})
