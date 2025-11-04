/**
 * B"H
 *
 * Robust Service Worker for Awtsmoos
 *
 * Strategy: Unified Network-First with Graceful Fallback
 * - This service worker handles all requests with the same intelligent logic.
 * - The server is expected to return a JSON metadata response if the 'Awtsmoos-File-Status' header is present.
 *
 * Process for every request:
 * 1. A special, NON-CACHED request is sent to the network with the 'Awtsmoos-File-Status' header.
 * 2. It safely attempts to parse the response as JSON.
 * 3. If JSON metadata is received, timestamps are compared to determine if the local cache is stale.
 *    - STALE: The actual resource (without the header) is fetched from the network, cached, and served.
 *    - FRESH: The resource is served directly from the cache.
 * 4. If the server fails to return JSON, the worker gracefully falls back to fetching the resource directly
 *    from the network and caching it, preventing errors.
 * 5. If the user is offline, any available cached version is served.
 */

const CACHE_NAME = 'awtsmoos-cache-v6';
const DB_NAME = 'awtsmoos-metadata-v6';
const STATUS_HEADER = 'Awtsmoos-File-Status';

// --- IndexedDB Helper (Unchanged) ---
const MetadataDB = {
    _db: null,
    async _getDB() {
        if (this._db) return this._db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = () => request.result.createObjectStore('metadata', { keyPath: 'url' });
            request.onsuccess = () => { this._db = request.result; resolve(this._db); };
            request.onerror = (e) => { console.error('IndexedDB error:', e); reject('IndexedDB error'); };
        });
    },
    async get(url) {
        const db = await this._getDB();
        return new Promise(resolve => {
            const tx = db.transaction('metadata', 'readonly').objectStore('metadata');
            const req = tx.get(url);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    },
    async set(metadata) {
        const db = await this._getDB();
        const tx = db.transaction('metadata', 'readwrite').objectStore('metadata');
        tx.put(metadata);
        return tx.done;
    }
};


// --- Service Worker Lifecycle ---

self.addEventListener('install', (event) => {
    console.log('[SW] Install Event.');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate Event.');
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

    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    event.respondWith(handleFetch(request));
});


/**
 * The core fetch handling logic for ALL requests.
 */
async function handleFetch(request) {
    try {
        // 1. Create a new request with the special status header.
        const newHeaders = new Headers(request.headers);
        newHeaders.append(STATUS_HEADER, 'true');
        
        const statusRequest = new Request(request.url, {
            method: request.method,
            headers: newHeaders,
            mode: 'same-origin',
            credentials: request.credentials,
            redirect: 'manual' // Prevent following redirects on the status check
        });

        // 2. Fetch the status, ALWAYS from the network.
        const statusResponse = await fetch(statusRequest, { cache: 'no-store' });

        if (!statusResponse.ok) {
            console.warn(`[SW] Status check failed for ${request.url}. Serving from cache.`);
            return getFromCache(request);
        }

        let serverMeta;
        try {
            // 3. **CRITICAL FIX**: Safely attempt to parse the response as JSON.
            serverMeta = await statusResponse.json();
        } catch (e) {
            // This block executes if the server didn't return valid JSON.
            console.warn(`[SW] Server did not return JSON for status check on ${request.url}. Fetching resource directly.`);
            // Fallback: fetch the original request and cache it without metadata.
            return fetchAndCache(request);
        }

        // 4. We have valid metadata, proceed with the normal logic.
        const localMeta = await MetadataDB.get(request.url);
        const isStale = (serverMeta.logicModified > (localMeta?.logicModified || 0)) ||
                        (serverMeta.dataModified > (localMeta?.dataModified || 0));

        if (isStale) {
            console.log(`%c[SW] Stale: ${request.url}`, 'color: orange');
            // Fetch the ACTUAL resource (using original request) and update everything.
            return fetchAndUpdate(request, serverMeta);
        } else {
            console.log(`%c[SW] Fresh: ${request.url}`, 'color: green');
            return getFromCache(request);
        }

    } catch (error) {
        // 5. OFFLINE: This catches any network failure.
        console.warn(`%c[SW] Offline: Serving from cache for ${request.url}`, 'color: grey');
        return getFromCache(request);
    }
}


/**
 * Fallback function: Fetches a request and caches it, but does NOT handle metadata.
 * Used when the server gives an unexpected (non-JSON) response.
 */
async function fetchAndCache(request) {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
}

/**
 * Main update function: Fetches the resource (using the original request) and updates
 * both the Cache and the IndexedDB with new metadata.
 */
async function fetchAndUpdate(request, metadata) {
    const networkResponse = await fetch(request); // Fetch the original resource without the header
    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        await MetadataDB.set({ url: request.url, ...metadata });
    }
    return networkResponse;
}

/**
 * Gets a resource from the cache. If not found, returns a network error.
 */
async function getFromCache(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    return new Response('Resource not found in cache and network is unavailable.', {
        status: 404,
        statusText: 'Not Found'
    });
}