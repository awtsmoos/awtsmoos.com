// B"H — Heichel Reader Service Worker
// Auto-clearing cache: the server stamps __AWTSMOOS_BUILD_ID__ with the running
// build identity on every deploy, so CACHE_VERSION changes automatically, the
// browser installs the new worker by itself, and old caches are deleted on
// activate. No human ever bumps a version string. HTML is network-first
// (always fresh). CSS/JS are cache-first with background revalidation.

const AWTSMOOS_BUILD_ID = '__AWTSMOOS_BUILD_ID__';
const CACHE_VERSION = AWTSMOOS_BUILD_ID.startsWith('__AWTSMOOS_BUILD')
	? 'heichel-reader-v4'
	: 'heichel-reader-' + AWTSMOOS_BUILD_ID;
const STATIC_CACHE = CACHE_VERSION + '-static';
const PAGES_CACHE = CACHE_VERSION + '-pages';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/heichelos/post/styles/meluket-sefer.css',
  '/heichelos/post/styles/reader-controls/torah-authority/settings-mobile.css',
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

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;
  
  // HTML pages: network-first, fallback to cache
  // This ensures users always get the freshest HTML
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const responseClone = response.clone();
        caches.open(PAGES_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // CSS/JS: cache-first with network revalidation
  // Serve from cache immediately, update in background
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
        
        // Return cached immediately, update in background
        return cachedResponse || networkFetch;
      })
    );
    return;
  }
  
  // Everything else: network-first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
