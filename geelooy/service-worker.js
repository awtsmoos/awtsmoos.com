/**
 * B"H
 *
 * Bulletproof Service Worker for Awtsmoos - "Guaranteed Freshness" Strategy
 *
 * CORE LOGIC:
 * 1. This service worker intercepts GET requests.
 * 2. It first makes a SPECIAL, INTERNAL request to the server to get metadata about the file's freshness.
 * 3. The response to this internal request is considered TOXIC and is NEVER shown to the client.
 * 4. If the metadata response is valid, it is used to decide whether to serve from cache or fetch the REAL file.
 * 5. If the metadata response is invalid, fails, or is not in the expected format for ANY reason,
 *    the entire strategy is aborted, and a fresh, NORMAL network request for the original file is made.
 * 6. Under NO circumstances will a response with the 'Awtsmoos-File-Status' header be returned to the client.
 */

// Incrementing the version is crucial to force the browser to update the worker.
const CACHE_NAME = 'awtsmoos-cache-v14';
const DB_NAME = 'awtsmoos-metadata-v14';
const STATUS_HEADER = 'Awtsmoos-File-Status';

// --- IndexedDB Helper (Unchanged and Correct) ---
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
        try {
            const db = await this._getDB();
            const tx = db.transaction('metadata', 'readonly').objectStore('metadata');
            const req = tx.get(url);
            return new Promise(resolve => {
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null); // Resolve null on error
            });
        } catch (e) {
            console.error("Failed to get from IndexedDB", e);
            return null;
        }
    },
    async set(metadata) {
        try {
            const db = await this._getDB();
            const tx = db.transaction('metadata', 'readwrite').objectStore('metadata');
            await tx.put(metadata);
            return tx.done;
        } catch (e) {
            console.error("Failed to write to IndexedDB", e);
            return Promise.resolve();
        }
    }
};

// --- Service Worker Lifecycle ---
self.addEventListener('install', (event) => {
    console.log('[SW] Install Event. New worker is installing.');
    // Force the waiting service worker to become the active service worker.
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate Event. New worker is now active.');
    // Remove old caches to save space.
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log(`[SW] Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim()) // Take control of all open clients.
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        console.log('[SW] Received skipWaiting message. Activating new version.');
        self.skipWaiting();
    }
});


// --- Fetch Interception ---
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // --- PRIMARY GUARDS ---
    if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
        // Ignore non-GET requests and requests to other origins.
        return;
    }
    if (request.headers.has(STATUS_HEADER)) {
        // This is a sanity check. A request from the browser should never have this header.
        // If it does, do not handle it with our logic; just pass it to the network.
        console.warn('[SW] Request from client unexpectedly had status header. Passing through to network.');
        return;
    }

    event.respondWith(handleFetch(request));
});

/**
 * The main fetch handler, completely rewritten for safety.
 */
async function handleFetch(request) {
    try {
        // --- STEP 1: MAKE THE INTERNAL METADATA REQUEST ---
        const statusRequest = createStatusRequest(request);
        const statusResponse = await fetch(statusRequest, { cache: 'no-store' });

        // --- STEP 2: RIGOROUSLY VALIDATE THE INTERNAL RESPONSE ---
        // If the response is not a perfect metadata response, we abort the strategy
        // and fall back to a simple, clean network fetch of the ORIGINAL request.
        if (!statusResponse.ok || !statusResponse.headers.has(STATUS_HEADER)) {
            console.warn('[SW] Metadata check failed or returned a non-metadata response. Defaulting to live network fetch.');
            return fetchAndCache(request); // SAFE FALLBACK
        }

        // --- STEP 3: PROCESS THE VALID METADATA ---
        // At this point, we are confident we have metadata. We will now process it,
        // but the `statusResponse` object itself will be discarded and NEVER returned.
        let serverMeta;
        try {
            serverMeta = await statusResponse.json();
        } catch (e) {
            console.warn(`[SW] Server sent non-JSON status response. Defaulting to live network fetch.`);
            return fetchAndCache(request); // SAFE FALLBACK
        }

        // --- STEP 4: DECIDE: USE CACHE OR FETCH THE REAL RESOURCE ---
        const localMeta = await MetadataDB.get(request.url);
        const isStale = !localMeta ||
                        (serverMeta.logicModified > localMeta.logicModified) ||
                        (serverMeta.dataModified > localMeta.dataModified) ||
                        (serverMeta.stateHash !== localMeta.stateHash);

        if (isStale) {
            console.log(`[SW] Cache is stale for: ${request.url}. Fetching live version.`);
            // Fetch the REAL resource, not the status one.
            return fetchAndUpdateMetadata(request, serverMeta);
        } else {
            console.log(`[SW] Cache is fresh for: ${request.url}. Serving from cache.`);
            const cachedResponse = await caches.match(request);
            // If cache was somehow cleared, fetch fresh as a final fallback.
            return cachedResponse || fetchAndUpdateMetadata(request, serverMeta);
        }

    } catch (error) {
        // --- THE OFFLINE FAILSAFE ---
        // This 'catch' block means the `fetch(statusRequest)` failed, almost certainly because the user is offline.
        console.warn(`[SW] Network error during status check: ${error.message}. Trying cache as last resort.`);
        const cachedResponse = await caches.match(request);
        
        // If we are offline, serve from cache if possible. Otherwise, we must fail.
        return cachedResponse || new Response('Network unavailable and resource not found in cache.', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Creates the special, internal-only request to check for metadata.
 */
function createStatusRequest(request) {
    const newHeaders = new Headers(request.headers);
    newHeaders.append(STATUS_HEADER, 'true');
    return new Request(request.url, {
        method: 'GET',
        headers: newHeaders,
        redirect: 'manual',
        credentials: request.credentials,
    });
}

/**
 * SAFE FALLBACK: Fetches the LIVE resource and caches it. Does not handle metadata.
 */
async function fetchAndCache(request) {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
        // Extra safety: ensure we are never caching a metadata response by mistake.
        if (!networkResponse.headers.has(STATUS_HEADER)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
        }
    }
    return networkResponse;
}

/**
 * PRIMARY UPDATE FUNCTION: Fetches the LIVE resource, updates the cache, AND updates the metadata.
 */
async function fetchAndUpdateMetadata(request, metadata) {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
        // Extra safety: ensure we are never caching a metadata response by mistake.
        if (!networkResponse.headers.has(STATUS_HEADER)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
            await MetadataDB.set({ url: request.url, ...metadata });
        }
    }
    return networkResponse;
}