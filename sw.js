// Service worker: deixa o app funcionar offline depois da primeira visita.
// A lista __PRECACHE__ e a versão são preenchidas no build por scripts/gen-sw.mjs.
const VERSION = "59dbe69d89"
const CACHE = `chess-analyzer-${VERSION}`
const PRECACHE = ["./","./COPYING-stockfish-GPLv3.txt","./favicon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./icons.svg","./index-CZdgFbLM.js","./index-m12GadNE.css","./index.html","./manifest.webmanifest","./stockfish-19-lite-single.js","./stockfish-19-lite-single.wasm"]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(Array.isArray(PRECACHE) ? PRECACHE : [])).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  // Páginas: tenta a rede (versão nova) e cai para o cache se estiver offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')))
    return
  }
  // Demais arquivos (nomes com hash, motor): cache primeiro.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
