/**
 * B"H
 *
 * Resilient Service Worker for Awtsmoos
 *
 * This version preserves the original "Intelligent Network-First" strategy while
 * hardening it against crashes and unexpected failures. It ensures that a valid
 * response or a cached asset is always returned, preventing generic browser errors.
 */

const CACHE_NAME = 'awtsmoos-cache-v9'; // Incremented version
const DB_NAME = 'awtsmoos-metadata-v9'; // Incremented version
const STATUS_HEADER = 'Awtsmoos-File-Status';
var doIt = false;
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
    console.log(`[SW] Activate Event: New version ${CACHE_NAME} is taking control.`);

    event.waitUntil(
        Promise.all([
            // 1. Clean up old Cache Storage
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // If the cache name is not the current one, delete it.
                        if (cacheName !== CACHE_NAME) {
                            console.log(`[SW] Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // 2. Clean up old IndexedDB databases
            (async () => {
                // indexedDB.databases() is the modern way to list DBs.
                // It's supported in Chrome/Edge/Opera but not Firefox/Safari.
                // It will gracefully do nothing in unsupported browsers.
                if (self.indexedDB && self.indexedDB.databases) {
                    try {
                        const databases = await self.indexedDB.databases();
                        return Promise.all(
                            databases.map(db => {
                                // We check if the name starts with our pattern but is NOT the current version.
                                if (db.name.startsWith('awtsmoos-metadata-') && db.name !== DB_NAME) {
                                    console.log(`[SW] Deleting old IndexedDB: ${db.name}`);
                                    return self.indexedDB.deleteDatabase(db.name);
                                }
                            })
                        );
                    } catch (error) {
                        console.error('[SW] Could not clean up IndexedDB databases:', error);
                    }
                }
            })()

        ]).then(() => {
            console.log('[SW] Cleanup complete. Claiming clients.');
            return self.clients.claim();
        })
    );
});
self.addEventListener('fetch', (event) => {
    const { request } = event;
    //console.log(request.url)
    if(!doIt) return;
    // If the incoming request already has our special status header,
    // it means this is a request made BY this service worker.
    // We must not handle it, so we return early and let it go to the network.
    if (request.headers.has(STATUS_HEADER)) {
        return; 
    }
   

    // The rest of your existing logic stays the same...
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
function isAwtsNaN(num) {
	return isNaN(num) || num === null || 
		num === undefined;
}
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
        const isStale =  (
		        
		       // isAwtsNaN(serverMeta.logicModified) || 
		    //    isAwtsNaN(serverMeta.dataModified) || 
		      //  isAwtsNaN(localMeta?.logicModified) ||
		    //    isAwtsNaN(localMeta?.dataModified) ||
		        serverMeta.logicModified > (localMeta?.logicModified || 0)) ||
                        (serverMeta.dataModified > (localMeta?.dataModified || 0));
	//console.log(request.url, serverMeta, localMeta);
        if (!doIt || isStale) {
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
 * Creates the special request used to check for metadata.
 */
function createStatusRequest(request) {
    const newHeaders = new Headers(request.headers);
    newHeaders.append(STATUS_HEADER, 'true');
    
    // The query parameter is no longer needed, so we can use the original URL.
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
    // THE CRITICAL FIX: The internal try/catch has been removed.
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