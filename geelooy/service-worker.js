/**
 * B"H
 *
 * Intelligent Service Worker for Awtsmoos
 *
 * Strategy: Cache with Server Validation
 * - Uses IndexedDB to store metadata (last modified timestamps).
 * - On fetch, it first asks the server for the resource's status.
 * - If the server version is newer, it fetches and updates the cache.
 * - If the local cache is fresh, it serves directly from the cache.
 * - If offline, it serves from the cache (Offline First).
 */

const CACHE_NAME = 'awtsmoos-cache-v1';
const DB_NAME = 'awtsmoos-metadata-v1';
const OFFLINE_URL = '/offline.html'; // Ensure you have this page

/**
 * --- IndexedDB Helper ---
 * A simple wrapper for getting/setting metadata.
 */
const MetadataDB = {
    _db: null,
    async _getDB() {
        if (this._db) return this._db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = () => request.result.createObjectStore('metadata', { keyPath: 'url' });
            request.onsuccess = () => {
                this._db = request.result;
                resolve(this._db);
            };
            request.onerror = (e) => reject('IndexedDB error:', e);
        });
    },
    async get(url) {
        const db = await this._getDB();
        return new Promise(resolve => {
            const tx = db.transaction('metadata', 'readonly');
            const store = tx.objectStore('metadata');
            const req = store.get(url);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null); // Resolve null on error
        });
    },
    async set(metadata) {
        const db = await this._getDB();
        const tx = db.transaction('metadata', 'readwrite');
        tx.objectStore('metadata').put(metadata);
        return tx.done;
    }
};

// --- Service Worker Lifecycle ---

self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event.');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// --- Fetch Interception ---

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests from our own origin
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    // Don't let the service worker try to cache itself
    if (url.pathname === '/service-worker.js') {
        return;
    }
    
    // Respond with our custom logic
    event.respondWith(handleFetch(request));
});


/**
 * The core fetch handling logic.
 * @param {Request} request The incoming request.
 */
async function handleFetch(request) {
    try {
        // 1. Ask the server for the latest file status
        const statusResponse = await fetch(request.url, {
            headers: { 'Awtsmoos-File-Status': 'true' }
        });

        if (!statusResponse.ok) {
            // If status check fails (e.g., 404), try cache as a fallback
            return await getFromCacheOrFallback(request);
        }

        const serverMeta = await statusResponse.json();
        const localMeta = await MetadataDB.get(request.url);

        // 2. Compare server timestamps with local timestamps
        const isStale = serverMeta.logicModified > (localMeta?.logicModified || 0) ||
                        serverMeta.dataModified > (localMeta?.dataModified || 0);

        if (isStale) {
            // 3. If stale, fetch from network, update cache and DB, then return
            console.log(`%c[SW] Stale: ${request.url}`, 'color: orange');
            return await fetchAndUpdate(request, serverMeta);
        } else {
            // 4. If fresh, serve from cache
            console.log(`%c[SW] Fresh: ${request.url}`, 'color: green');
            return await getFromCacheOrFallback(request);
        }

    } catch (error) {
        // 5. If the status check fails (offline), serve from cache
        console.warn(`%c[SW] Offline: ${request.url}`, 'color: grey');
        return await getFromCacheOrFallback(request);
    }
}

/**
 * Fetches from network, updates cache and metadata, and returns the response.
 */
async function fetchAndUpdate(request, metadata) {
    const networkResponse = await fetch(request);
    
    // Check for a valid response before caching
    if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        await MetadataDB.set({ url: request.url, ...metadata });
    }
    
    return networkResponse;
}

/**
 * Tries to get a response from the cache, falling back to the offline page for navigations.
 */
async function getFromCacheOrFallback(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // If it was a page navigation and it's not in the cache, show the offline page.
    if (request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
    }

    // For other failed requests (like images) not in cache, let the browser handle the error.
    return new Response('Network error and not in cache', { status: 404, statusText: 'Not Found' });
}