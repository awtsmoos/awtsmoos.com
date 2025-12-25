//B"H
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
 *
 * B"H - REVISION: Excluded /api/ calls from caching logic to ensure real-time database results.
 */

// Incrementing the version is crucial to force the browser to update the worker.
const CACHE_NAME = 'awtsmoos-cache-v20';
const DB_NAME = 'awtsmoos-metadata-v20';
const STATUS_HEADER = 'Awtsmoos-File-Status';

// --- IndexedDB Helper (Robust Version) ---
const MetadataDB = {
    _db: null,
    _opening: null, // Promise to handle concurrent open requests

    async _getDB() {
        if (this._db) return this._db;
        if (this._opening) return this._opening;

        this._opening = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata', { keyPath: 'url' });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                this._db = db;
                this._opening = null;

                // CRITICAL: Listen for closure events to prevent "The database connection is closing" errors
                db.onclose = () => {
                    console.log('[MetadataDB] Connection closed automatically.');
                    this._db = null;
                };
                
                db.onversionchange = () => {
                    console.log('[MetadataDB] Version change detected. Closing.');
                    db.close();
                    this._db = null;
                };
                
                db.onerror = (e) => {
                     console.log('[MetadataDB] Connection error:', e);
                     this._db = null;
                };

                resolve(db);
            };

            request.onerror = (e) => {
                console.error('IndexedDB open error:', e);
                this._opening = null;
                reject('IndexedDB error');
            };
        });
        
        return this._opening;
    },

    async get(url) {
        try {
            return await this._performGet(url);
        } catch (e) {
            // RETRY STRATEGY: If connection is bad, reset and try ONCE more.
            if (e && (e.name === 'InvalidStateError' || e.message?.includes('closing'))) {
                console.warn('[MetadataDB] Connection closed during get. Retrying...');
                this._db = null;
                try {
                    return await this._performGet(url);
                } catch (retryErr) {
                    console.error('[MetadataDB] Retry failed:', retryErr);
                    return null;
                }
            }
            console.error("Failed to get from IndexedDB", e);
            return null;
        }
    },

    async _performGet(url) {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction('metadata', 'readonly');
                const store = tx.objectStore('metadata');
                const req = store.get(url);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null); // Resolve null on error to keep flow moving
            } catch (err) {
                reject(err); // Catch synchronous transaction creation errors
            }
        });
    },

    async set(metadata) {
        try {
            await this._performSet(metadata);
        } catch (e) {
             // RETRY STRATEGY
             if (e && (e.name === 'InvalidStateError' || e.message?.includes('closing'))) {
                console.warn('[MetadataDB] Connection closed during set. Retrying...');
                this._db = null;
                try {
                    await this._performSet(metadata);
                } catch (retryErr) {
                    console.error('[MetadataDB] Set retry failed', retryErr);
                }
            } else {
                console.error("Failed to write to IndexedDB", e);
            }
        }
    },

    async _performSet(metadata) {
         const db = await this._getDB();
         return new Promise((resolve, reject) => {
             try {
                 const tx = db.transaction('metadata', 'readwrite');
                 const store = tx.objectStore('metadata');
                 store.put(metadata);
                 // Native JS uses oncomplete, not .done
                 tx.oncomplete = () => resolve();
                 tx.onerror = () => reject(tx.error);
             } catch (err) {
                 reject(err);
             }
         });
    }
};

// --- Service Worker Lifecycle ---
self.addEventListener('install', (event) => {
    console.log('[SW] Install Event. New worker is installing.');
    // Force the waiting service worker to become the active service worker.
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate Event. Cleaning up old assets...');

    // 1. Clean up old Cache Storage
    const cacheCleanup = caches.keys().then((cacheNames) => {
        return Promise.all(
            cacheNames
                .filter(name => name.startsWith('awtsmoos-cache-') && name !== CACHE_NAME)
                .map(name => {
                    console.log(`[SW] Deleting old cache: ${name}`);
                    return caches.delete(name);
                })
        );
    });

    // 2. Clean up old IndexedDB Metadata
    const dbCleanup = (async () => {
        // Check if browser supports listing databases (Chrome/Edge/Firefox do)
        if (indexedDB.databases) {
            try {
                const dbs = await indexedDB.databases();
                for (const db of dbs) {
                    // If it starts with our prefix but isn't the CURRENT version, kill it.
                    if (db.name && db.name.startsWith('awtsmoos-metadata-') && db.name !== DB_NAME) {
                        console.log(`[SW] Deleting old DB: ${db.name}`);
                        const req = indexedDB.deleteDatabase(db.name);
                        req.onerror = () => console.warn(`[SW] Failed to delete DB ${db.name}`);
                        req.onsuccess = () => console.log(`[SW] Deleted DB ${db.name}`);
                    }
                }
            } catch (e) {
                console.warn("[SW] Error cleaning old databases:", e);
            }
        }
    })();

    // Wait for both cleanups to finish, then take control immediately
    event.waitUntil(
        Promise.all([cacheCleanup, dbCleanup])
            .then(() => {
                console.log('[SW] Cleanup complete. Claiming clients.');
                return self.clients.claim();
            })
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
    if (
        request.method !== 'GET' || 
        !request.url.startsWith(self.location.origin) ||
        request.url.includes('/api/') // B"H - Never cache dynamic API wisdom
    ) {
        // Ignore non-GET requests, other origins, or dynamic API calls.
        return;
    }
    if (request.headers.has(STATUS_HEADER)) {
        // Sanity check: do not handle status checks with status checks
        return;
    }

    event.respondWith(handleFetch(request));
});

/**
 * The main fetch handler.
 */
async function handleFetch(request) {
    try {
        // --- STEP 1: MAKE THE INTERNAL METADATA REQUEST ---
        const statusRequest = createStatusRequest(request);
        const statusResponse = await fetch(statusRequest, {
            cache: 'no-store',
            headers: {
                ...(request.headers || {}),
                [STATUS_HEADER]: "true"
            }
        });

        // --- STEP 2: VALIDATE RESPONSE ---
        if (!statusResponse.ok) {
            return fetchAndCache(request); 
        }

        // --- STEP 3: PROCESS JSON ---
        let serverMeta;
        try {
            serverMeta = await statusResponse.json();
        } catch (e) {
            return fetchAndCache(request); 
        }

        // --- STEP 3.25: CHECK FOR EXPLICIT REDIRECT INSTRUCTION ---
        if (serverMeta && serverMeta.redirect) {
            return new Response(null, {
                status: 301,
                statusText: "Moved Permanently",
                headers: {
                    "Location": serverMeta.redirect,
                    "Content-Length": "0"
                }
            });
        }

        // --- STEP 3.5: SHAPE CHECK ---
        if (
            !serverMeta || 
            typeof serverMeta.stateHash === 'undefined' || 
            typeof serverMeta.logicModified === 'undefined'
        ) {
            return fetchAndCache(request);
        }

        // --- STEP 4: CHECK FRESHNESS ---
        const localMeta = await MetadataDB.get(request.url);
        
        const isStale = !localMeta ||
                        (serverMeta.logicModified > (localMeta.logicModified || 0)) ||
                        (serverMeta.dataModified > (localMeta.dataModified || 0)) ||
                        (serverMeta.stateHash !== localMeta.stateHash);

        if (isStale) {
            return fetchAndUpdateMetadata(request, serverMeta);
        } else {
            const cachedResponse = await caches.match(request.url); 
            return cachedResponse || fetchAndUpdateMetadata(request, serverMeta);
        }

    } catch (error) {
        console.warn(`[SW] Network error: ${error.message}. Fallback to cache.`);
        const cachedResponse = await caches.match(request.url);
        
        return cachedResponse || new Response('Network unavailable', {
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
 * SAFE FALLBACK: Fetches LIVE resource using STRING URL.
 */
async function fetchAndCache(request) {
    const networkResponse = await fetch(request.url, { 
        cache: 'reload',
        credentials: 'include' 
    });

    if (networkResponse) {
        if (networkResponse.redirected && networkResponse.url !== request.url) {
             return new Response(null, {
                status: 301,
                statusText: "Moved Permanently",
                headers: {
                    "Location": networkResponse.url,
                    "Content-Length": "0"
                }
            });
        }

        if (networkResponse.ok && !networkResponse.headers.has(STATUS_HEADER)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request.url, networkResponse.clone());
        }
    }
    return networkResponse;
}

/**
 * PRIMARY UPDATE: Fetches LIVE resource using STRING URL.
 */
async function fetchAndUpdateMetadata(request, metadata) {
    const networkResponse = await fetch(request.url, { 
        cache: 'reload',
        credentials: 'include' 
    });

    if (networkResponse) {
        if (networkResponse.redirected && networkResponse.url !== request.url) {
             return new Response(null, {
                status: 301,
                statusText: "Moved Permanently",
                headers: {
                    "Location": networkResponse.url,
                    "Content-Length": "0"
                }
            });
        }

        if (networkResponse.ok && !networkResponse.headers.has(STATUS_HEADER)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request.url, networkResponse.clone());
            await MetadataDB.set({ url: request.url, ...metadata });
        }
    }
    return networkResponse;
}

self.addEventListener('push', (event) => {
    event.waitUntil(
        fetch('/api/social/mail/notify/getLatest')
            .then(res => res.json())
            .then(data => {
                if(!data.found) return;

                const options = {
                    body: data.body,
                    icon: '/favicon.ico', 
                    data: data.data, 
                    actions: [
                        {
                            action: 'reply',
                            type: 'text',
                            title: 'Reply',
                            placeholder: 'Type a message...'
                        }
                    ]
                };

                return self.registration.showNotification(data.title, options);
            })
    );
});

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;
    const replyText = event.reply;

    if (action === 'reply' && replyText) {
        const msgData = notification.data;
        const promise = fetch(`/api/social/mail/sendTo/${encodeURIComponent(msgData.correspondent)}/from/me`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                subject: "Re: " + msgData.subject,
                content: replyText
            })
        });

        event.waitUntil(promise);
    }
    
    notification.close();
});
