/**
 * B"H
 *
 * Resilient Service Worker for Awtsmoos
 *
 * Strategy: Intelligent Network-First with a Robust Network Fallback
 *
 * This service worker is designed to be highly resilient and to NEVER show a "not in cache"
 * error to an online user.
 *
 * --- LOGIC HIERARCHY ---
 * 1. ATTEMPT INTELLIGENT CHECK: It first tries to fetch metadata from the server using the
 *    'Awtsmoos-File-Status' header. If this works perfectly, it compares timestamps to
 *    decide whether to serve a fresh copy or a fast cached copy.
 *
 * 2. ROBUST NETWORK FALLBACK: If the intelligent check fails for ANY online reason (e.g., the
 *    server returns a 404, a 500 error, or unexpected non-JSON data), the service worker
 *    ABANDONS the intelligent check for that request and immediately falls back to fetching
 *    the resource directly from the network. This guarantees online users always get content.
 *
 * 3. CACHE AS LAST RESORT: Only if the network fallback itself fails (meaning the user is
 *    truly offline) will the service worker attempt to serve the resource from the cache.
 */

const CACHE_NAME = 'awtsmoos-cache-v7';
const DB_NAME = 'awtsmoos-metadata-v7';
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
 * The main fetch handler with the new resilient logic.
 */
async function handleFetch(request) {
    // We wrap the entire logic in a try/catch. The catch block will only execute
    // for network failures, meaning the user is truly offline.
    try {
        // --- 1. ATTEMPT INTELLIGENT CHECK ---
        const statusRequest = createStatusRequest(request);
        const statusResponse = await fetch(statusRequest, { cache: 'no-store' });

        // If the server gives an error on the status check, abandon this method and
        // fall back to a direct network fetch.
        if (!statusResponse.ok) {
            console.warn(`[SW] Status check failed for ${request.url}. Falling back to network.`);
            return fetchAndCache(request);
        }

        let serverMeta;
        try {
            serverMeta = await statusResponse.json();
        } catch (e) {
            // If the server gives a non-JSON response, abandon this method and
            // fall back to a direct network fetch.
            console.warn(`[SW] Server sent non-JSON status for ${request.url}. Falling back to network.`);
            return fetchAndCache(request);
        }

        // --- At this point, the intelligent check was successful. We have metadata. ---
        const localMeta = await MetadataDB.get(request.url);
        const isStale = (serverMeta.logicModified > (localMeta?.logicModified || 0)) ||
                        (serverMeta.dataModified > (localMeta?.dataModified || 0));

        if (isStale) {
            console.log(`%c[SW] Stale: ${request.url}`, 'color: orange');
            // Fetch the actual resource and update cache and metadata.
            return fetchAndUpdate(request, serverMeta);
        } else {
            console.log(`%c[SW] Fresh: ${request.url}`, 'color: green');
            // The metadata says we are fresh. Try the cache first.
            const cachedResponse = await caches.match(request);
            // If for some reason it's not in the cache, fetch it anyway to self-heal.
            return cachedResponse || fetchAndUpdate(request, serverMeta);
        }

    } catch (error) {
        // --- 3. CACHE AS LAST RESORT ---
        // This block only runs if ANY of the above network fetches failed.
        // This is the true "offline" path.
        console.warn(`%c[SW] Network failed. Serving from cache for ${request.url}`, 'color: grey');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Only return this message if we are offline AND the item is not in the cache.
        return new Response('Resource not found in cache and network is unavailable.', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

/**
 * Creates the special request used to check for metadata.
 */
function createStatusRequest(request) {
    const newHeaders = new Headers(request.headers);
    newHeaders.append(STATUS_HEADER, 'true');
    return new Request(request.url, {
        method: request.method,
        headers: newHeaders,
        mode: 'same-origin',
        credentials: request.credentials,
        redirect: 'manual'
    });
}

/**
 * The standard network fallback. Fetches the original request, caches it,
 * but does NOT handle metadata.
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
 * The full update process. Fetches the original request and updates
 * both the Cache and the IndexedDB with new metadata.
 */
async function fetchAndUpdate(request, metadata) {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        await MetadataDB.set({ url: request.url, ...metadata });
    }
    return networkResponse;
}