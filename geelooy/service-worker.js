self.addEventListener('fetch', (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    // --- On navigation, if online, clear the cache ---
    if (event.request.mode === 'navigate' && navigator.onLine) {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('Service Worker: Deleting cache on navigation:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }

    // --- 1. Skip caching for specific request types ---
    // Don't cache POST requests
    if (request.method === 'POST') {
        return event.respondWith(fetch(request));
    }

    // Don't cache OPTIONS (preflight) requests
    if (request.method === 'OPTIONS') {
       return event.respondWith(fetch(request));
    }

    // Don't cache requests for specific file extensions
    const fileExtension = requestUrl.pathname.substring(requestUrl.pathname.lastIndexOf('.')).toLowerCase();
    if (NO_CACHE_EXTENSIONS.includes(fileExtension)) {
       return event.respondWith(fetch(request));
    }

    // --- 2. Network-first strategy with cache fallback and offline support ---
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                // Check if the response is valid before caching
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If the network request fails, try to serve from the cache
                return caches.match(request).then((cachedResponse) => {
                    return cachedResponse || caches.match(OFFLINE_URL);
                });
            })
    );
});