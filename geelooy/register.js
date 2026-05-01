// B"H
// Service Worker Kill-Switch: Unregisters all workers and clears all caches

async function killServiceWorkers() {
    if (!('serviceWorker' in navigator)) return;

    try {
        // 1. Get all active registrations
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            console.log('[Kill-Switch] Unregistering worker at scope:', registration.scope);
            await registration.unregister();
        }

        // 2. Clear all Cache Storage
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => {
                console.log('[Kill-Switch] Deleting cache:', name);
                return caches.delete(name);
            }));
        }

        // 3. Clear the Metadata IndexedDB used in the previous version
        const DB_NAME_PREFIX = 'awtsmoos-metadata-';
        if ('indexedDB' in window && indexedDB.databases) {
            const dbs = await indexedDB.databases();
            for (const db of dbs) {
                if (db.name && db.name.startsWith(DB_NAME_PREFIX)) {
                    console.log('[Kill-Switch] Deleting DB:', db.name);
                    indexedDB.deleteDatabase(db.name);
                }
            }
        }

        console.log('[Kill-Switch] Cleanup complete. Service worker functionality removed.');
        
        // Optional: Force reload to ensure the page is no longer controlled (only do this once)
        if (navigator.serviceWorker.controller) {
            window.location.reload();
        }

    } catch (error) {
        console.error('[Kill-Switch] Error during cleanup:', error);
    }
}

killServiceWorkers();