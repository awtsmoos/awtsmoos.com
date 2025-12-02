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
const CACHE_NAME = 'awtsmoos-cache-v15';
const DB_NAME = 'awtsmoos-metadata-v15';
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
            // console.log(`[SW] Stale. Fetching live: ${request.url}`);
            return fetchAndUpdateMetadata(request, serverMeta);
        } else {
            // console.log(`[SW] Fresh. Serving cache: ${request.url}`);
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
    // FIX: Pass request.url (String) and manually include credentials.
    // Do NOT pass the 'request' object directly.
    const networkResponse = await fetch(request.url, { 
        cache: 'reload',
        credentials: 'include' // CRITICAL for auth
    });

    if (networkResponse && networkResponse.ok) {
        if (!networkResponse.headers.has(STATUS_HEADER)) {
            const cache = await caches.open(CACHE_NAME);
            // Key by URL String
            await cache.put(request.url, networkResponse.clone());
        }
    }
    return networkResponse;
}

/**
 * PRIMARY UPDATE: Fetches LIVE resource using STRING URL.
 */
async function fetchAndUpdateMetadata(request, metadata) {
    // FIX: Pass request.url (String) and manually include credentials.
    const networkResponse = await fetch(request.url, { 
        cache: 'reload',
        credentials: 'include' // CRITICAL for auth
    });

    if (networkResponse && networkResponse.ok) {
        if (!networkResponse.headers.has(STATUS_HEADER)) {
            const cache = await caches.open(CACHE_NAME);
            
            // 1. Save Content keyed by URL String
            await cache.put(request.url, networkResponse.clone());
            
            // 2. Save Metadata keyed by URL String
            await MetadataDB.set({ url: request.url, ...metadata });
        }
    }
    return networkResponse;
}

// B"H
// Add to service-worker.js
self.addEventListener('push', (event) => {
    // 1. Wake Up! We received a signal.
    // 2. Fetch the actual content securely
    event.waitUntil(
        fetch('/api/social/mail/notify/getLatest')
            .then(res => res.json())
            .then(data => {
                if(!data.found) return;

                const options = {
                    body: data.body,
                    icon: '/favicon.ico', // Ensure this exists
                    data: data.data, // Store metadata for the reply
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
        // Send the reply
        const msgData = notification.data;
        
        // Construct the API call to your existing sendMail function
        // We assume the user has a cookie, so we just hit the endpoint
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