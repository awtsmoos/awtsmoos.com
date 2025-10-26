/**
 * B"H
 * Rewritten Service Worker for awtsmoos
 *
 * Features:
 * - Network-first strategy: Always tries to fetch fresh content when online.
 * - Cache-only strategy: Serves cached content when offline.
 * - Skips caching for POST requests.
 * - Skips caching for OPTIONS (preflight) requests.
 * - Skips caching for specified file extensions (e.g., .mp4, .zip).
 * - Robust error handling to prevent caching issues from blocking network requests.
 * - Aggressive cache cleanup on activation.
 */

const CACHE_NAME = 'awtsmoos-v2'; // Increment version to ensure new service worker takes over
const OFFLINE_URL = '/offline.html'; // Define a simple offline page to serve when no cache match
const NO_CACHE_EXTENSIONS = [
    '.mp4', '.zip', '.rar', '.exe', '.dmg', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.tgz', '.tar', '.gz', '.7z', // Add more as needed
    // Consider if you want to exclude certain image types, but usually images are good to cache
];

console.log("Service Worker: Loading...");

self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event triggered. Pre-caching offline page...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Pre-cache the offline page
            return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        }).then(() => {
            console.log('Service Worker: Offline page pre-cached successfully.');
            return self.skipWaiting(); // Force the activating service worker to become the active worker
        }).catch((error) => {
            console.error('Service Worker: Failed to pre-cache offline page:', error);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event triggered. Cleaning up old caches...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve(); // Resolve for caches that match CACHE_NAME
                })
            );
        }).then(() => {
            console.log('Service Worker: Old caches cleaned up.');
            return self.clients.claim(); // Take control of un-controlled clients (pages)
        }).catch((error) => {
            console.error('Service Worker: Error during cache cleanup:', error);
        })
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    // --- 1. Skip caching for specific request types ---
    // Don't cache POST requests
    if (request.method === 'POST') {
        console.log('Service Worker: Skipping caching for POST request:', request.url);
        return event.respondWith(fetch(request));
    }

    // Don't cache OPTIONS (preflight) requests
    if (request.method === 'OPTIONS') {
        console.log('Service Worker: Skipping caching for OPTIONS request:', request.url);
        return event.respondWith(fetch(request));
    }

    // Don't cache requests for specific file extensions
    const fileExtension = requestUrl.pathname.substring(requestUrl.pathname.lastIndexOf('.')).toLowerCase();
    if (NO_CACHE_EXTENSIONS.includes(fileExtension)) {
        console.log(`Service Worker: Skipping caching for extension "${fileExtension}":`, request.url);
        return event.respondWith(fetch(request));
    }

    // --- 2. Network-first strategy with cache fallback and offline support ---
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            // Try fetching from the network first
            const fetchAndCache = fetch(request)
                .then((networkResponse) => {
                    // Check if the response is valid before caching
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        // We clone the response because a response can only be consumed once.
                        // We consume it once by caching it, and once by returning it.
                        console.log('Service Worker: Fetched and caching:', request.url);
                        try {
                            cache.put(request, networkResponse.clone());
                        } catch (cacheError) {
                            console.warn('Service Worker: Failed to cache network response, but still serving it:', request.url, cacheError);
                            // Even if caching fails, we still want to return the network response
                        }
                    } else {
                        console.log(`Service Worker: Not caching response (status: ${networkResponse.status}, type: ${networkResponse.type || 'unknown'}):`, request.url);
                    }
                    return networkResponse;
                })
                .catch((networkError) => {
                    // This catch block handles network errors (e.g., offline)
                    console.warn('Service Worker: Network request failed, trying cache:', request.url, networkError.message);
                    return cache.match(request); // Try to get from cache
                });

            // If we have a cached response, return it immediately while the network request is happening.
            // This provides an "offline-first with freshness check" approach.
            return cache.match(request).then((cachedResponse) => {
                // If there's a cached response, return it, otherwise wait for the network fetch
                return cachedResponse || fetchAndCache;
            }).catch((cacheMatchError) => {
                // Handle errors during cache.match() itself
                console.error('Service Worker: Error matching request in cache:', request.url, cacheMatchError);
                return fetchAndCache; // Fallback to network fetch if cache matching fails
            });

        }).catch((cacheOpenError) => {
            // This catches errors when opening the cache itself
            console.error('Service Worker: Error opening cache, falling back to network-only:', cacheOpenError);
            return fetch(request).catch((finalNetworkError) => {
                console.error('Service Worker: Network failed and cache failed for:', request.url, finalNetworkError);
                // If all else fails, serve the offline page if it's a navigation request
                if (request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
                // For other requests (e.g., images, scripts) if truly nothing works,
                // the browser will typically show its own network error.
                throw finalNetworkError; // Re-throw to indicate a complete failure
            });
        })
    );
});

self.addEventListener('message', (event) => {
    // Optional: You can add messaging functionality here
    // For example, to tell the main thread when a new version is available
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});