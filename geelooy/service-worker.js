/**
 * B"H
 *
 * Resilient Service Worker for Awtsmoos - "Guaranteed Freshness" Strategy
 *
 * This service worker is designed to be both fast and extremely safe by leveraging
 * the existing server-side status check.
 *
 * THE CORE RULE:
 * Any failure or uncertainty during the freshness check (e.g., a network blip,
 * a server error, malformed JSON) immediately triggers a fallback to fetch the
 * live version from the network. The cache is only used if it can be proven
 * to be 100% fresh, or if the user is completely offline.
 */

const CACHE_NAME = 'awtsmoos-cache-v11'; // Incremented for a clean update
const DB_NAME = 'awtsmoos-metadata-v11'; // Incremented for a clean update
const STATUS_HEADER = 'Awtsmoos-File-Status';

// --- IndexedDB Helper (Unchanged from your original robust version) ---
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

// --- Service Worker Lifecycle (Standard and correct) ---
self.addEventListener('install', (event) => {
    console.log('[SW] Install Event.');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate Event.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// --- Fetch Interception ---
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests for our own origin.
    if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
        return;
    }

    // This is the entry point to our robust logic.
    event.respondWith(handleFetch(request));
});

/**
 * The main fetch handler with the hardened "Cache, but Verify" logic.
 */
async function handleFetch(request) {
    try {
        // --- STEP 1: ATTEMPT THE INTELLIGENT VERIFICATION ---
        const statusRequest = createStatusRequest(request);
        const statusResponse = await fetch(statusRequest, { cache: 'no-store' });

        // DOUBT CHECK #1: Did the server respond with an error?
        if (!statusResponse.ok) {
            console.warn(`[SW] Status check failed with server error ${statusResponse.status}. Defaulting to live fetch.`);
            // If there's doubt, we go straight to the network.
            return await fetchAndCacheFallback(request);
        }

        let serverMeta;
        try {
            serverMeta = await statusResponse.json();
        } catch (e) {
            // DOUBT CHECK #2: Did the server send invalid JSON?
            console.warn(`[SW] Server sent non-JSON status. Defaulting to live fetch.`);
            // If there's doubt, we go straight to the network.
            return await fetchAndCacheFallback(request);
        }

        const localMeta = await MetadataDB.get(request.url);

        // --- STEP 2: COMPARE METADATA TO DETERMINE FRESHNESS ---
        // This is the core comparison logic, using all three server metrics.
        const isStale = !localMeta ||
                        (serverMeta.logicModified > localMeta.logicModified) ||
                        (serverMeta.dataModified > localMeta.dataModified) ||
                        (serverMeta.stateHash !== localMeta.stateHash);

        if (isStale) {
            // Cache is stale or non-existent, so we must fetch the live version.
            console.log(`[SW] Cache is stale. Fetching live version for: ${request.url}`);
            return await fetchAndUpdateMetadata(request, serverMeta);
        } else {
            // Cache is GUARANTEED LEGIT. Serve from cache.
            console.log(`[SW] Cache is fresh. Serving from cache for: ${request.url}`);
            const cachedResponse = await caches.match(request);
            
            // If for some reason the cache was cleared by the browser, fetch live as a fallback.
            return cachedResponse || await fetchAndUpdateMetadata(request, serverMeta);
        }

    } catch (error) {
        // --- STEP 3: THE ULTIMATE FAILSAFE (NETWORK FAILURE DURING STATUS CHECK) ---
        // This 'catch' block runs if the `fetch(statusRequest)` fails entirely (e.g., user is offline).
        console.warn(`[SW] Status check network error (${error.message}). Defaulting to live fetch attempt.`);
        
        try {
            // As per the rule, we FIRST attempt to get the live version.
            return await fetchAndCacheFallback(request);
        } catch (networkError) {
            // If (and ONLY if) the live attempt also fails, we fall back to the cache as a last resort.
            console.error(`[SW] Final network fetch failed. Serving from cache as last resort for: ${request.url}`);
            const cachedResponse = await caches.match(request);
            
            // If there's nothing in the cache, we must return a proper offline response.
            return cachedResponse || new Response('Network unavailable and resource not found in cache.', {
                status: 404,
                statusText: 'Not Found'
            });
        }
    }
}

/**
 * Creates the special request used to check for metadata.
 */
function createStatusRequest(request) {
    const newHeaders = new Headers(request.headers);
    newHeaders.append(STATUS_HEADER, 'true');
    // Ensure we don't send cookies from other origins with the status request
    // Note: The 'credentials' property is part of the Request object constructor options
    return new Request(request.url, {
        method: 'GET',
        headers: newHeaders,
        redirect: 'manual',
        credentials: request.credentials, // Preserve credentials setting
    });
}

/**
 * Fetches the live resource, updates the cache, AND updates the metadata in IndexedDB.
 * This is the primary function for updating stale content.
 */
async function fetchAndUpdateMetadata(request, metadata) {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        // We use await here to ensure these operations complete before returning.
        await cache.put(request, networkResponse.clone());
        await MetadataDB.set({ url: request.url, ...metadata });
    }
    return networkResponse;
}

/**
 * A simpler network fallback. It fetches and caches but does NOT handle metadata.
 * This is used when the intelligent check system fails and we just need to get the file.
 */
async function fetchAndCacheFallback(request) {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
}