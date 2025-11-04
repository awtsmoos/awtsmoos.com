// B"H
// Production-Ready Service Worker Registration
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

        // The browser will automatically handle updates in the background.
        // When the new service worker is ready, it will move from a "waiting"
        // to an "active" state on the next page load or navigation.
        // This is a much safer and more stable update process.

    } catch (error) {
        console.error('Service Worker: Registration failed:', error);
    }
}

registerServiceWorker();
