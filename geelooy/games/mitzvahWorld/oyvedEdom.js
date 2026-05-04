/**
 * B"H
 * @file oyvedEdom.js
 * @description
 * THE GREAT DISSOLUTION.
 * This worker has been dismissed to ensure direct emanation from the Source.
 * It will now unregister itself and clear all earthly caches.
 */

self.addEventListener('install', (event) => {
    console.log('B"H - 🧹 [OYVED_EDOM]: Installation received. Command: SELF-DESTRUCT.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('B"H - 🌊 [OYVED_EDOM]: Activating Purge...');
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => {
            console.log('B"H - ✨ [OYVED_EDOM]: Caches cleared. Dissolving registration...');
            return self.registration.unregister();
        }).then(() => {
            return self.clients.matchAll();
        }).then((clients) => {
            clients.forEach(client => client.navigate(client.url));
            console.log('B"H - 🏁 [OYVED_EDOM]: Mission Complete. Direct connection restored.');
        })
    );
});
