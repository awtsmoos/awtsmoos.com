// B"H
/**
 * B"H
 * Self-Destructing Service Worker
 * This file replaces the previous logic to ensure the worker removes itself from the client's browser.
 */

self.addEventListener('install', (event) => {
    // Force this new "empty" worker to activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Unregister itself and then notify all open tabs to reload to clear the controller
    event.waitUntil(
        self.registration.unregister()
            .then(() => self.clients.matchAll())
            .then((clients) => {
                clients.forEach(client => {
                    if (client.url && 'navigate' in client) {
                        client.navigate(client.url);
                    }
                });
            })
            .then(() => {
                console.log('[SW] Self-destructed and unregistered.');
            })
    );
});

// No fetch listeners = No caching, no interference.