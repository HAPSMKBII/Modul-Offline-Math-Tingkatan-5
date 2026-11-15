// Modul Offline Matematik T5 — service worker
// Tukar VERSI setiap kali index.html dikemas kini supaya telefon murid menerima versi baharu.
const VERSI = 'modul-t5-v3.0-2026-11-15';
const WAJIB = ['./index.html'];
const PILIHAN = ['./', './manifest.webmanifest', './ikon-192.png', './ikon-512.png',
  './ikon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI)
    .then(c => c.addAll(WAJIB).then(() => Promise.all(PILIHAN.map(f => c.add(f).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Halaman: cuba rangkaian dahulu (dapat versi terbaru), guna cache jika luar talian
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const k = r.clone(); caches.open(VERSI).then(c => c.put('./index.html', k)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Fail lain: cache dahulu
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
