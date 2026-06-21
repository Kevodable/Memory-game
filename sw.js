const CACHE_NAME = 'kids-fun-planet-memory-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/mascots/banner.jpg',
  './assets/mascots/cards/kip.jpg',
  './assets/mascots/cards/kip_back.jpg',
  './assets/mascots/cards/stella.jpg',
  './assets/mascots/cards/bolt.jpg',
  './assets/mascots/cards/bobo.jpg',
  './assets/mascots/cards/bobo_back.jpg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

const APP_SHELL = ['./', './index.html', './style.css', './script.js', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function isAppShell(url) {
  return APP_SHELL.some((path) => url.endsWith(path.replace('./', '/')) || url.endsWith(path));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const isNavigation = request.mode === 'navigate';
  const url = new URL(request.url);

  if (isNavigation || isAppShell(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    })
  );
});
