/**
 * Service worker: makes the app work offline (e.g. phone in the kitchen
 * without signal). Bump CACHE_VERSION whenever you deploy changed assets
 * so returning visitors get the new files immediately.
 */
const CACHE_VERSION = 'v1';
const CACHE = `reis-wasser-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/js/main.js',
  './assets/js/config.js',
  './assets/js/router.js',
  './assets/js/store.js',
  './assets/js/data/rice.js',
  './assets/js/lib/calc.js',
  './assets/js/lib/dom.js',
  './assets/js/lib/storage.js',
  './assets/js/views/home.js',
  './assets/js/views/detail.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/apple-touch-icon.png',
];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Serve from cache immediately, refresh the cache in the background. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
  const network = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin || FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
