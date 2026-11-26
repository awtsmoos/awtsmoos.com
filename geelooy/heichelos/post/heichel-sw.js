// B"H — Heichel Reader Service Worker
// Auto-clearing cache: the server stamps __AWTSMOOS_BUILD_ID__ with the running
// build identity on every deploy, so CACHE_VERSION changes automatically, the
// browser installs the new worker by itself, and old caches are deleted on
// activate. No human ever bumps a version string. HTML is network-first
// (always fresh). CSS/JS are cache-first with background revalidation.
// B"H batch 54 — restore the __AWTSMOOS_BUILD_ID__ placeholder: batch 53
// staged the SERVED (already stamped) file, so the literal batch-52 SHA
// 18e36a32a was committed and the served SW still reports the batch-52
// build id. The placeholder is what the server stamps on deploy.
// B"H e2 epoch (2026-11-25): CACHE_VERSION carries a manual '-e2' epoch
// beside the build id. The build id only moves when the server process
// restarts on a new HEAD, but static rounds (git push, no restart) can
// change JS in place under unpinned or hand-tagged URLs — the cosmic
// palette re-base e653e5839 did exactly that, and this worker's
// cache-first law kept serving the old painter from the un-purged
// heichel-reader-<build> caches. The epoch renames the caches once, so
// the activate purge below deletes the stale ones and returning
// browsers refetch the current code with no manual cache clearing.
// B"H e3 epoch (2026-11-26): the e2 fetch handler could resolve
// respondWith() with `undefined` — caches.match() on a miss resolves
// undefined, so any network failure on an uncached request became the
// console TypeError "Failed to convert value to 'Response'" and the
// fetch died inside this worker (DevTools on the live series page,
// 2026-11-25: the page navigation itself was rejected by the worker).
// The handler also intercepted /api/ and media requests from heichel
// pages, putting the series player's playlist fetch and its audio
// behind a cache law they never needed. The e3 law, in the fetch
// handler below: only GET is intercepted; /api/ and audio/video are
// never intercepted; every respondWith promise resolves to a real
// Response — on total failure a synthetic 504, never undefined. The
// epoch renames the caches once more so the activate purge retires
// every e2 cache and returning browsers refetch under the new law.

const AWTSMOOS_BUILD_ID = '__AWTSMOOS_BUILD_ID__';
const CACHE_VERSION = AWTSMOOS_BUILD_ID.startsWith('__AWTSMOOS_BUILD')
	? 'heichel-reader-v6'
	: 'heichel-reader-' + AWTSMOOS_BUILD_ID + '-e3';
const STATIC_CACHE = CACHE_VERSION + '-static';
const PAGES_CACHE = CACHE_VERSION + '-pages';

// Assets to pre-cache on install — B"H 2026-10-13: expanded to cover the
// critical JS boot chain so repeat visits are instant (app-like).
const PRECACHE_URLS = [
  '/heichelos/post/styles/post-bundle.css?v=dd53bd36f0',
  '/heichelos/post/styles/reader-law8-live.css?v=eecc4a1f86',
  '/heichelos/post/styles/reader-tree-live.css?v=d3912735de',
  '/heichelos/post/styles/reader-controls/torah-authority/settings-mobile.css',
  '/heichelos/post/postLogic.js?v=c1a288bd51',
  '/shared/MeaningfulActivity.js',
  '/heichelos/post/logic/initialization/bootstrap.js?v=reader-runtime-048',
  '/heichelos/post/logic/initialization/ReaderBootState.js?v=reader-runtime-004',
  '/heichelos/post/logic/initialization/ReaderEnhancementOrchestrator.js?v=reader-runtime-008',
  '/heichelos/post/logic/initialization/ReaderShellControlsBoot.js?v=reader-runtime-005',
  '/heichelos/post/logic/initialization/chitasLoader.js?v=chitas-loader-1',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that isn't the current version
          if (cacheName.startsWith('heichel-reader-') && cacheName !== STATIC_CACHE && cacheName !== PAGES_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// B"H e3 — the last-resort answer when network and cache both fail.
// A respondWith promise must resolve to a Response; resolving with
// undefined is what produced the "Failed to convert value to
// 'Response'" TypeError that killed live fetches under the e2 law.
function offlineResponse() {
  return new Response('Awtsmoos is unreachable right now. Please retry in a moment.', {
    status: 504,
    statusText: 'Gateway Timeout',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

async function cacheOrOffline(request) {
  const cached = await caches.match(request);
  return cached || offlineResponse();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only GET is ever intercepted — a mutation must reach the network
  // exactly as the page sent it.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // API and media are NEVER intercepted: the series player's playlist
  // fetch, the platform panel's calls, and every audio/video stream go
  // straight to the network, exactly as if no worker existed. The
  // worker exists to make static reading instant — never to stand
  // between the page and live data or sound.
  if (url.pathname.startsWith('/api/') || request.destination === 'audio' || request.destination === 'video') return;

  // HTML pages: network-first, fallback to cache
  // This ensures users always get the freshest HTML
  // B"H batch 50 — only cache a GOOD response: the old code cached
  // whatever fetch returned, including a 502 during a restart, so the
  // 502 poisoned the page cache and the next load served the stale
  // cached HTML (old bundle pin) instead of the fresh page — that is
  // how the whole batch-49 render stayed stale after the deploy.
  // A failed/502 response is returned to the page but never stored.
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(PAGES_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => cacheOrOffline(request))
    );
    return;
  }

  // CSS/JS: cache-first with network revalidation
  // Serve from cache immediately, update in background
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse || offlineResponse());

        // Return cached immediately, update in background
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // Everything else (images, fonts, manifests): network-first,
  // cache fallback, synthetic 504 last — never undefined.
  event.respondWith(
    fetch(request).catch(() => cacheOrOffline(request))
  );
});
