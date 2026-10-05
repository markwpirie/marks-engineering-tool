// ══════════════════════════════════════════════════════════
// M.E.T. service worker — offline support
// Precaches the app shell on install, then serves every same-origin GET stale-while-revalidate:
// instant from cache (works with no signal offshore), refreshed in the background when online.
// PDFs are not precached (14 MB) — each one is cached the first time it's opened.
//
// Bump CACHE_VERSION whenever a file is added to or removed from PRECACHE. Edits to existing
// files don't need a bump: stale-while-revalidate picks them up on the next load after a visit.
// ══════════════════════════════════════════════════════════
const CACHE_VERSION = 'met-v4.4-1';

const PRECACHE = [
  './',
  'index.html',
  'css/style.css',
  'css/fonts.css',
  'css/fonts/inter-greek-656bbe.woff2',
  'css/fonts/jetbrains-mono-greek-495eef.woff2',
  'css/fonts/jetbrains-mono-latin-95d8bd.woff2',
  'css/fonts/jetbrains-mono-latin-ext-8ff363.woff2',
  'css/fonts/montserrat-latin-b6711d.woff2',
  'css/fonts/montserrat-latin-ext-c33f88.woff2',
  'css/fonts/playfair-display-latin-613a72.woff2',
  'css/fonts/playfair-display-latin-ext-59406b.woff2',
  'css/fonts/playfair-display-italic-latin-f450b4.woff2',
  'css/fonts/playfair-display-italic-latin-ext-19ad25.woff2',
  'js/core-utils.js',
  'js/data-atex.js',
  'js/data-glands.js',
  'js/data-cable.js',
  'js/data-is.js',
  'js/data-motors.js',
  'js/data-symbols.js',
  'js/data-docregister.js',
  'js/tabs/tab-symbols.js',
  'js/tabs/tab-atex.js',
  'js/tabs/tab-units.js',
  'js/tabs/tab-calcs.js',
  'js/tabs/tab-cable.js',
  'js/tabs/tab-cable-install.js',
  'js/tabs/tab-wonder.js',
  'js/tabs/tab-isloop.js',
  'js/tabs/tab-npt.js',
  'js/tabs/tab-prompts.js',
  'js/reorder.js',
  'js/shell.js',
  'js/app.js',
  'jpg/501-453.jpg',
  'jpg/icg653.jpg',
  'jpg/501-421.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('met-') && k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Deep links (#cable?…) never reach the network — the hash is client-side — so '/' and
  // 'index.html' are the only navigation URLs to worry about.
  event.respondWith(
    caches.open(CACHE_VERSION).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
