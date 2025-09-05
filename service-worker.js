const CACHE_NAME = 'abnahme-cache-test-v1.0.4.';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './form.js',
  './form_data.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './img/logo.png',
  './vendor/pdf-lib.min.js',
  './fonts/DejaVuSans.ttf'
];

self.addEventListener('message', event => {
  if (event.data === 'getVersion') {
    event.source.postMessage({ type: 'version', version: CACHE_NAME });
  }
});


self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(ASSETS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) await cache.put(url, res.clone());
      } catch (e) { /* ignorieren */ }
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME) && caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      // same-origin Antworten cachen
      const url = new URL(req.url);
      if (res.ok && url.origin === location.origin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      // Optional: Offline-Fallbacks
      return new Response('Offline und Ressource nicht im Cache.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});

