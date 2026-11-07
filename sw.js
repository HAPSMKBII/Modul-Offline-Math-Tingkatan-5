/* Service worker: simpan modul dalam telefon supaya boleh dibuka tanpa internet.
   Apabila anda memuat naik versi baharu modul, tukar nombor VERSI di bawah. */
var VERSI = 'modul-t5-v4';
var FAIL = ['./index.html', './manifest.webmanifest', './ikon-192.png', './ikon-512.png', './ikon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(FAIL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== VERSI; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Ambil dari simpanan telefon dahulu. Modul hanya dimuat turun semula apabila VERSI ditukar,
   supaya kuota internet murid dan had bandwidth hos tidak dibazirkan. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  var key = e.request.mode === 'navigate' ? './index.html' : e.request;
  e.respondWith(caches.open(VERSI).then(function (c) {
    return c.match(key, { ignoreSearch: true }).then(function (simpanan) {
      return simpanan || fetch(e.request).then(function (r) {
        if (r && r.ok) c.put(key, r.clone());
        return r;
      });
    });
  }));
});
