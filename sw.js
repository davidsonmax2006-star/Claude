// When shipping changes: bump CACHE here and the ?v= number on the files in index.html and FILES below.
var CACHE = 'myplans-v3';
var FILES = [
  './', 'index.html', 'style.css?v=3', 'app.js?v=3', 'guides.js?v=3', 'manifest.webmanifest',
  'content/gym.js?v=3', 'content/meals.js?v=3', 'content/recipes.js?v=3', 'content/shopping.js?v=3',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(FILES.map(function (u) { return new Request(u, { cache: 'reload' }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  var isPage = req.mode === 'navigate';
  e.respondWith(
    isPage
      // HTML: network first so updates arrive, cache when offline.
      ? fetch(req).then(function (res) {
          if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('./', copy); }); }
          return res;
        }).catch(function () { return caches.match('./').then(function (m) { return m || caches.match('index.html'); }); })
      // Everything else: serve cache, refresh in background.
      : caches.match(req).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
            return res;
          });
          net.catch(function () {});
          return hit || net;
        }).catch(function () { return caches.match(req); })
  );
});
