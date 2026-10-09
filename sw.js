// Keeps the app opening without network. Bump the version when the app files change.
var CACHE = 'ssv-receipts-a19b8923';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Answer from the saved copy at once, and refresh that copy in the background.
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var fresh = fetch(req).then(function (res) { if (res && res.ok) c.put(req, res.clone()); return res; });
      if (hit) { fresh.catch(function () {}); return hit; }
      return fresh.catch(function () { return c.match('index.html'); });
    });
  }));
});
