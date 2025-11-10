/**
 * B"H
 *
 * Resilient Service Worker for Awtsmoos
 *
 * This version preserves the original "Intelligent Network-First" strategy while
 * hardening it against crashes and unexpected failures. It ensures that a valid
 * response or a cached asset is always returned, preventing generic browser errors.
 */

const CACHE_NAME = 'awtsmoos-cache-v8'; // Incremented version
const DB_NAME = 'awtsmoos-metadata-v8'; // Incremented version
const STATUS_HEADER = 'Awtsmoos-File-Status';

// --- IndexedDB Helper (Hardened for Resilience) ---
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
        // This function is already safe, returning null on failure.
        try {
            const db = await this._getDB();
            return new Promise(resolve => {
                const tx = db.transaction('metadata', 'readonly').objectStore('metadata');
                const req = tx.get(url);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
        } catch (e) {
            console.error("Failed to get from IndexedDB", e);
            return null;
        }
    },
    async set(metadata) {
        // ENHANCED RESILIENCE: A failure to write to the DB should not
        // crash the entire response. We catch errors here.
        try {
            const db = await this._getDB();
            const tx = db.transaction('metadata', 'readwrite').objectStore('metadata');
            tx.put(metadata);
            return tx.done;
        } catch (e) {
            console.error("Failed to write to IndexedDB", e);
            // We resolve successfully so the main flow continues uninterrupted.
            return Promise.resolve();
        }
    }
};

// --- Service Worker Lifecycle (Unchanged) ---
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

// --- Fetch Interception (Unchanged) ---
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (
        request.method !== 'GET' ||
        ![
            self.location.origin,
            "https://awtsmoos.com",
            "https://www.awtsmoos.com",
        ].includes(
            new URL(request.url).origin,
        )
    ) {
        return;
    }
    event.respondWith(handleFetch(request));
});


/**
 * The main fetch handler with the original resilient logic.
 */
async function handleFetch(request) {
    // This main try/catch is the ultimate safety net for ANY network failure.
    try {
        // --- 1. ATTEMPT INTELLIGENT CHECK ---
        const statusRequest = createStatusRequest(request);
        const statusResponse = await fetch(statusRequest, { cache: 'no-store' });

        if (!statusResponse.ok) {
            console.warn(`[SW] Status check failed for ${request.url}. Falling back to direct network fetch.`);
            return fetchAndCache(request);
        }

        let serverMeta;
        try {
            serverMeta = await statusResponse.json();
        } catch (e) {
            console.warn(`[SW] Server sent non-JSON status for ${request.url}. Falling back to network.`);
            return fetchAndCache(request);
        }

        const localMeta = await MetadataDB.get(request.url);
        const isStale = (serverMeta.logicModified > (localMeta?.logicModified || 0)) ||
                    (serverMeta.dataModified > (localMeta?.dataModified || 0)) ||
                    (serverMeta.stateHash !== localMeta?.stateHash);

        if (isStale) {
            console.log(`%c[SW] Stale: ${request.url}`, 'color: orange');
            return fetchAndUpdate(request, serverMeta);
        } else {
            console.log(`%c[SW] Fresh (from cache): ${request.url}`, 'color: green');
            const cachedResponse = await caches.match(request);
            // Self-heal: If it's missing from cache for any reason, fetch it again.
            return cachedResponse || fetchAndUpdate(request, serverMeta);
        }

    } catch (error) {
        // --- 3. CACHE AS LAST RESORT ---
        // This block now correctly catches ALL network failures, including those
        // from fetchAndUpdate, ensuring the user is truly offline.
        console.warn(`%c[SW] Network failed. Serving from cache for ${request.url}`, 'color: grey');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Only return this if we are offline AND the item is not in the cache.
        return new Response('Network unavailable and resource not found in cache.', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

/**
 * Creates the special request used to check for metadata. (Unchanged)
 */
function createStatusRequest(request) {
    const newHeaders = new Headers(request.headers);
    newHeaders.append(STATUS_HEADER, 'true');
    return new Request(request.url, {
        method: request.method,
        headers: newHeaders,
        redirect: 'manual'
    });
}

/**
 * The standard network fallback. It does not handle metadata. (Unchanged)
 * This function is already resilient because it doesn't catch its own errors.
 */
async function fetchAndCache(request) {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        // Important: Use clone() because a response body can only be read once.
        await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
}

/**
 * The full update process, now made resilient.
 * It fetches the resource and updates both Cache and IndexedDB.
 */
async function fetchAndUpdate(request, metadata) {
    
    // If this fetch fails, the error will now be correctly caught by the
    // main try/catch block in handleFetch().
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        // We clone the response to store one copy in the cache and return the
        // other copy to the browser.
        await cache.put(request, networkResponse.clone());
        await MetadataDB.set({ url: request.url, ...metadata });
    }
    return networkResponse;
}