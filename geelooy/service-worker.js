/**
 * B"H
 *
 * Robust Service Worker for Awtsmoos
 *
 * Strategy: Network-First, Falling Back to Cache
 * - This service worker prioritizes getting the latest content from the server when online.
 * - It uses IndexedDB to store metadata (last modified timestamps) about cached resources.
 * - On a request, it first performs a GET request to the server to check for updates.
 *   THIS "STATUS CHECK" REQUEST IS NEVER CACHED.
 * - It reads the timestamp metadata from the JSON BODY of that response.
 * - If the server's version is newer (stale), it fetches the full resource, updates the cache and metadata, and serves the new content.
 * - If the local version is fresh, it serves the content directly from the cache.
 * - If the user is offline, it immediately serves the previously visited content from the cache.
 */

const CACHE_NAME = 'awtsmoos-cache-v4'; // Incremented version to ensure update
const DB_NAME = 'awtsmoos-metadata-v4';

/**
 * --- IndexedDB Metadata Helper ---
 * A self-contained wrapper for getting/setting resource metadata.
 */
const MetadataDB = {
    _db: null,
    async _getDB() {
        if (this._db) return this._db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains('metadata')) {
                    request.result.createObjectStore('metadata', { keyPath: 'url' });
                }
            };
            request.onsuccess = () => {
                this._db = request.result;
                resolve(this._db);
            };
            request.onerror = (e) => {
                console.error('IndexedDB error:', e);
                reject('IndexedDB error');
            };
        });
    },
    async get(url) {
        try {
            const db = await this._getDB();
            return new Promise(resolve => {
                const tx = db.transaction('metadata', 'readonly');
                const store = tx.objectStore('metadata');
                const req = store.get(url);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
        } catch (error) {
            console.error('Failed to get metadata from DB:', error);
            return null;
        }
    },
    async set(metadata) {
        try {
            const db = await this._getDB();
            const tx = db.transaction('metadata', 'readwrite');
            tx.objectStore('metadata').put(metadata);
            return tx.done;
        } catch (error) {
            console.error('Failed to set metadata in DB:', error);
        }
    }
};

// --- Service Worker Lifecycle ---

self.addEventListener('install', (event) => {
    console.log('[SW] Install Event.');
    // Force the waiting service worker to become the active one.
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate Event.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                // Delete old caches that don't match the current CACHE_NAME.
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        }).then(() => {
            // Take immediate control of all open pages.
            return self.clients.claim();
        })
    );
});

// --- Fetch Interception ---

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignore non-GET requests and requests from other origins
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }
    
    // Do not let the service worker cache itself
    if (new URL(request.url).pathname === '/service-worker.js') {
        return;
    }

    event.respondWith(handleFetch(request));
});


/**
 * The core fetch handling logic. Checks the network first, then falls back to cache.
 * @param {Request} request The incoming request.
 */
async function handleFetch(request) {
    try {
        // 1. **CRITICAL FIX**: Check server for status with a GET request.
        // This request is configured to *never* be served from the cache.
        const statusResponse = await fetch(request, {
            cache: 'no-store' // This is the key: forces a network request, solving the original problem.
        });

        if (!statusResponse.ok) {
            // If the server check fails (e.g., 404), try the cache as a final resort.
            return await getFromCache(request);
        }

        // 2. Read the metadata from the JSON body of the response.
        const serverMeta = await statusResponse.json();
        const localMeta = await MetadataDB.get(request.url);

        // 3. Compare server timestamps with local timestamps from IndexedDB.
        const isStale = (serverMeta.logicModified > (localMeta?.logicModified || 0)) ||
                        (serverMeta.dataModified > (localMeta?.dataModified || 0));

        if (isStale) {
            // 4. If stale, fetch the full resource again to cache it, update DB, and return the fresh response.
            console.log(`%c[SW] Stale: ${request.url}`, 'color: orange');
            // The statusResponse from the check is a valid response, so we can use it directly
            // to update the cache, avoiding a second network request.
            return await updateCacheAndDB(request, statusResponse, serverMeta);
        } else {
            // 5. If fresh, serve from cache. This is fast and what users expect.
            console.log(`%c[SW] Fresh: ${request.url}`, 'color: green');
            return await getFromCache(request);
        }

    } catch (error) {
        // 6. OFFLINE: If the network fails entirely, serve from the cache.
        console.warn(`%c[SW] Offline: Serving from cache for ${request.url}`, 'color: grey');
        return await getFromCache(request);
    }
}

/**
 * Updates the cache and IndexedDB with a new response and its metadata.
 */
async function updateCacheAndDB(request, response, metadata) {
    const cache = await caches.open(CACHE_NAME);
    // Store a clone of the response in the cache, because the body can only be read once.
    await cache.put(request, response.clone());
    // Update the metadata for this URL in IndexedDB.
    await MetadataDB.set({ url: request.url, ...metadata });
    // Return the original response to the browser.
    return response;
}


/**
 * Tries to get a response from the cache. If not found, it fails,
 * letting the browser show its default network error.
 */
async function getFromCache(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // If not in cache, let the request fail. This will trigger the browser's
    // default "no internet" page if offline, which is the correct behavior.
    return new Response('Resource not found in cache and network is unavailable.', {
        status: 404,
        statusText: 'Not Found'
    });
}