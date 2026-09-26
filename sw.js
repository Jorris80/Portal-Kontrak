/* Service worker: cangkang aplikasi tersimpan untuk dibuka luring.
   config.js SELALU diambil dari jaringan dulu (agar URL baru langsung berlaku).
   Permintaan ke Apps Script (POST) tidak pernah disimpan di cache. */
var CACHE = 'ccms-1.2.0';
var CANGKANG = ['./', 'index.html', 'manifest.webmanifest', 'ikon.svg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CANGKANG); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (/config\.js$/.test(u.pathname)) {
    e.respondWith(fetch(r, { cache: 'no-store' }).then(function (res) {
      var salin = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, salin); }); return res;
    }).catch(function () { return caches.match(r); }));
    return;
  }
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(function (res) {
      var salin = res.clone(); caches.open(CACHE).then(function (c) { c.put('index.html', salin); }); return res;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r); }));
});
