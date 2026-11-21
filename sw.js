// Modul Offline Matematik T5 — service worker
// Tukar VERSI setiap kali index.html dikemas kini supaya telefon murid menerima versi baharu.
const VERSI = 'modul-t5-v3.1-2026-11-21';
const WAJIB = ['./index.html'];
const PILIHAN = ['./', './manifest.webmanifest', './kiraan.js', './ikon-192.png', './ikon-512.png',
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
// Cuba rangkaian dahulu (dapat versi terbaru), guna cache jika luar talian
function rangkaianDahulu(req, kunci) {
  return fetch(req).then(r => {
    if (r && r.ok) { const k = r.clone(); caches.open(VERSI).then(c => c.put(kunci, k)); }
    return r;
  }).catch(() => caches.match(kunci));
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Permintaan ke laman lain (cth. kiraan pengguna) tidak disentuh
  if (url.origin !== self.location.origin) return;
  // Halaman
  if (req.mode === 'navigate') { e.respondWith(rangkaianDahulu(req, './index.html')); return; }
  // Tetapan kiraan: sentiasa ambil versi terbaru supaya perubahan kod GoatCounter sampai ke telefon
  if (url.pathname.endsWith('/kiraan.js')) { e.respondWith(rangkaianDahulu(req, './kiraan.js')); return; }
  // Fail lain: cache dahulu
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
