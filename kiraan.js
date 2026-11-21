/* =================================================================
   KIRAAN PENGGUNA TANPA NAMA - Modul Matematik Tingkatan 5
   -----------------------------------------------------------------
   Mengira berapa ramai yang membuka modul dan setiap bab, melalui
   GoatCounter (percuma, tiada kuki, tiada nama murid).

   CARA HIDUPKAN (sekali sahaja):
   1. Daftar akaun di https://www.goatcounter.com/signup
      dan pilih "Code", contohnya: modult5bugaya
   2. Tulis kod itu di antara tanda petik di bawah, contohnya:
          var KIRAAN_KOD = 'modult5bugaya';
   3. Simpan (Commit). Lihat statistik di
          https://modult5bugaya.goatcounter.com

   Biarkan kosong ('') untuk MEMATIKAN kiraan.
   ================================================================= */
var KIRAAN_KOD = 'sirhap';

(function () {
  'use strict';
  var KOD = String(window.KIRAAN_KOD || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!KOD) return;

  /* Kira hanya apabila dibuka dari laman web sebenar (bukan fail dalam telefon atau komputer ujian) */
  var host = location.hostname;
  if (!/^https?:$/.test(location.protocol) || !host || host === 'localhost' || host === '127.0.0.1') return;
  try { if (navigator.webdriver) return; } catch (e) {}

  window.KIRAAN_AKTIF = true;

  var URL_KIRA = 'https://' + KOD + '.goatcounter.com/count';
  var QK = 'modulT5-kiraan-q', SK = 'modulT5-kiraan-sesi', MAX = 40, CUBA = 8;
  var BAB = ['Ubahan', 'Matriks', 'Insurans', 'Percukaian', 'Kekongruenan, Pembesaran dan Gabungan Transformasi',
    'Nisbah dan Graf Fungsi Trigonometri', 'Sukatan Serakan Data Terkumpul', 'Pemodelan Matematik'];

  function lsGet() { try { var q = JSON.parse(localStorage.getItem(QK) || '[]'); return Object.prototype.toString.call(q) === '[object Array]' ? q : []; } catch (e) { return []; } }
  function lsSet(q) { try { localStorage.setItem(QK, JSON.stringify(q.slice(-MAX))); } catch (e) {} }
  function sesi(k) { try { var s = JSON.parse(sessionStorage.getItem(SK) || '{}'); if (s[k]) return false; s[k] = 1; sessionStorage.setItem(SK, JSON.stringify(s)); return true; } catch (e) { return true; } }

  /* Rekod disimpan dalam baris gilir dahulu, jadi pembukaan tanpa internet dihantar kemudian */
  function rekod(p, t, ev) {
    var q = lsGet(); q.push({ p: p, t: t, e: ev ? 1 : 0, n: 0 }); lsSet(q); hantar();
  }

  var sibuk = false;
  function satu(it, cb) {
    var s = ''; try { s = screen.width + ',' + screen.height + ',' + (window.devicePixelRatio || 1); } catch (e) {}
    var u = URL_KIRA + '?p=' + encodeURIComponent(it.p) + '&t=' + encodeURIComponent(it.t || '') +
      (it.e ? '&e=true' : '') + '&s=' + encodeURIComponent(s) + '&rnd=' + Math.random().toString(36).slice(2);
    var img = new Image(), siap = false;
    var tm = setTimeout(function () { tamat(false); }, 15000);
    function tamat(ok) { if (siap) return; siap = true; clearTimeout(tm); cb(ok); }
    img.onload = function () { tamat(true); };
    img.onerror = function () { tamat(false); };
    img.src = u;
  }
  function hantar() {
    if (sibuk) return;
    try { if (navigator.onLine === false) return; } catch (e) {}
    var q = lsGet(); if (!q.length) return;
    sibuk = true;
    satu(q[0], function (ok) {
      sibuk = false;
      var r = lsGet(); if (!r.length) return;
      if (ok) r.shift();
      else { r[0].n = (r[0].n || 0) + 1; if (r[0].n >= CUBA) r.shift(); lsSet(r); return; }
      lsSet(r);
      if (r.length) setTimeout(hantar, 400);
    });
  }

  function apl() {
    try { if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true; } catch (e) {}
    return !!navigator.standalone;
  }

  /* 1) Pembukaan modul: sekali bagi setiap sesi (muat semula tidak dikira dua kali) */
  if (sesi('buka')) rekod(apl() ? '/aplikasi' : '/', apl() ? 'Dibuka sebagai aplikasi (dipasang)' : 'Dibuka dalam pelayar');

  /* 2) Bab yang dibuka: sekali bagi setiap bab dalam satu sesi */
  function bab() {
    var m = /^#bab-([1-8])$/.exec(location.hash); if (!m) return;
    var n = +m[1]; if (sesi('bab' + n)) rekod('bab-' + n, 'Bab ' + n + ': ' + BAB[n - 1], true);
  }
  bab();
  window.addEventListener('hashchange', bab);

  /* 3) Modul dipasang ke skrin utama */
  window.addEventListener('appinstalled', function () { rekod('pasang-aplikasi', 'Dipasang ke skrin utama', true); });

  /* Hantar rekod tertangguh apabila internet kembali */
  window.addEventListener('online', hantar);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) hantar(); });
})();
