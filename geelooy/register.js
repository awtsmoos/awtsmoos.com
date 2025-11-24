// B"H
// Production-Ready Service Worker Registration with Update Handling
const SERVICE_WORKER_PATH = '/service-worker.js';

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker: Browser does not support Service Workers.');
        return;
    }

    try {
        console.log(`Service Worker: Attempting to register ${SERVICE_WORKER_PATH}...`);
        const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
        console.log('Service Worker: Registered successfully with scope:', registration.scope);

        // --- UPDATE HANDLING LOGIC ---

        // 1. Listen for the 'updatefound' event. This is triggered when a new
        //    service worker has been found and is beginning to install.
        registration.addEventListener('updatefound', () => {
            console.log('[SW Register] A new service worker version has been found.');
            const newWorker = registration.installing;

            // 2. Listen for the 'statechange' on the new worker.
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    // 3. Once the new worker is 'installed', it means it's ready and waiting
                    //    to take over. At this point, we can notify the user.
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[SW Register] New service worker is installed and waiting.');
                        // Now, show a notification to the user.
                        showUpdateNotification(newWorker);
                    }
                });
            }
        });

    } catch (error) {
        console.error('Service Worker: Registration failed:', error);
    }
}

/**
 * Shows a UI element (like a toast or banner) to the user, letting them
 * know an update is available.
 * @param {ServiceWorker} worker The new service worker that is waiting.
 */
function showUpdateNotification(worker) {
    // This is a simple example using a basic div.
    // In a real app, you would use a styled toast notification or banner.
    const updateBanner = document.createElement('div');
    updateBanner.id = 'sw-update-banner';
    updateBanner.innerHTML = `
        <span>A new version of the site is available.</span>
        <button id="sw-update-button">Refresh</button>
    `;
    // Add some basic styling to make it visible
    updateBanner.style.position = 'fixed';
    updateBanner.style.bottom = '20px';
    updateBanner.style.left = '20px';
    updateBanner.style.padding = '1em';
    updateBanner.style.backgroundColor = '#333';
    updateBanner.style.color = 'white';
    updateBanner.style.border = '1px solid white';
    updateBanner.style.borderRadius = '5px';
    updateBanner.style.zIndex = '10000';

    document.body.appendChild(updateBanner);

    document.getElementById('sw-update-button').addEventListener('click', () => {
        console.log('[SW Register] User clicked refresh. Activating new worker.');
        // This message tells the waiting service worker to take control.
        worker.postMessage({ action: 'skipWaiting' });
    });
}

// We also need a listener to reload the page once the new worker has taken control.
navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW Register] Controller has changed. Reloading page.');
    // The page MUST be reloaded to use the assets from the new service worker's cache.
    window.location.reload();
});


// Start the registration process.
registerServiceWorker();