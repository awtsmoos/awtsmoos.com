/**
 * B"H
 *
 * Complete Service Worker for Awtsmoos
 *
 * Strategy:
 * 1.  On Install: Pre-caches an offline fallback page and immediately takes control.
 * 2.  On Activate: Cleans up any caches from previous versions of the service worker.
 * 3.  On Fetch (Online):
 *     - If it's a page navigation (refresh, new tab), it first DELETES the entire cache to ensure freshness.
 *     - It then fetches all requests from the network first ("Network First").
 *     - Successful network responses are put into the cache for future offline use.
 * 4.  On Fetch (Offline):
 *     - It serves requests directly from the cache ("Cache Only").
 *     - If a page is not in the cache, it serves the offline fallback page.
 */

const CACHE_NAME = 'awtsmoos-v3'; // Increment version to trigger an update
const OFFLINE_URL = '/offline.html'; // A dedicated page to show when offline
const NO_CACHE_EXTENSIONS = [
    // Archives and installers
    '.mp4', '.zip', '.rar', '.exe', '.dmg', '.pdf',
    '.tgz', '.tar', '.gz', '.7z',
    // Documents (often updated, better to fetch fresh)
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
];

console.log(`Service Worker: Loading... Cache version is ${CACHE_NAME}`);

/**
 * INSTALL: Called when the service worker is first installed or updated.
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event triggered.');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching offline page.');
            return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        }).then(() => {
            // Force the new service worker to become active immediately.
            return self.skipWaiting();
        }).catch((error) => {
            console.error('Service Worker: Failed to pre-cache offline page during install:', error);
        })
    );
});

/**
 * ACTIVATE: Called after install. This is the perfect place to clean up old caches.
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event triggered.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // If a cache's name is different from our current one, delete it.
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Old caches cleaned up.');
            // Take control of all open clients (tabs) without needing a reload.
            return self.clients.claim();
        }).catch((error) => {
            console.error('Service Worker: Error during cache cleanup in activate event:', error);
        })
    );
});

/**
 * FETCH: Intercepts all network requests.
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const requestUrl = new URL(request.url);

    // --- 1. Bypass Caching for Specific Request Types ---

    // Don't cache POST requests as they are not idempotent.
    if (request.method === 'POST') {
        return event.respondWith(fetch(request));
    }

    // Don't cache OPTIONS (preflight) requests.
    if (request.method === 'OPTIONS') {
        return event.respondWith(fetch(request));
    }

    // Don't cache requests for specific file extensions.
    const fileExtension = requestUrl.pathname.substring(requestUrl.pathname.lastIndexOf('.')).toLowerCase();
    if (NO_CACHE_EXTENSIONS.includes(fileExtension)) {
        return event.respondWith(fetch(request));
    }

    // --- 2. Aggressive Cache Clearing for Online Navigations ---

    // If it's a page navigation and the user is online, wipe the cache first.
    if (request.mode === 'navigate' && navigator.onLine) {
        console.log('Service Worker: Online navigation detected. Clearing cache before fetching.');
        // We don't block the fetch request for this, let it happen in the background.
        const clearCache = caches.open(CACHE_NAME).then((cache) => {
            return cache.keys().then(keys => {
                return Promise.all(keys.map(key => cache.delete(key)));
            });
        });
        event.waitUntil(clearCache);
    }
    
    // --- 3. Network-First Strategy (with Cache Fallback) ---

    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                // If the network request is successful, cache it and return it.
                console.log(`Service Worker: Fetched from network: ${request.url}`);

                // Check for a valid response to cache.
                // Some responses (e.g., from third-party extensions) are "opaque" and can't be cached.
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }

                return networkResponse;
            })
            .catch((error) => {
                // If the network request fails (e.g., user is offline), try the cache.
                console.warn(`Service Worker: Network request failed for ${request.url}. Trying cache...`, error.message);
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log(`Service Worker: Serving from cache: ${request.url}`);
                        return cachedResponse;
                    }

                    // If the request is for a page and it's not in the cache, show the offline page.
                    if (request.mode === 'navigate') {
                        console.log('Service Worker: Serving offline page as fallback.');
                        return caches.match(OFFLINE_URL);
                    }
                    
                    // For other failed requests (like images) not in cache, let the browser handle the error.
                    return Promise.reject(error);
                });
            })
    );
});

/**
 * MESSAGE: Allows communication from the client to the service worker.
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});