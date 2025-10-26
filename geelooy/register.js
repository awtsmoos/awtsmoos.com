// B"H
// This script aggressively unregisters existing service workers and then registers a new one.
// Use with caution, as this bypasses the standard service worker update flow
// and is generally NOT recommended for production environments.
 
const SERVICE_WORKER_PATH = '/service-worker.js'; // Ensure this path is correct

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        console.log('Service Worker: Browser supports Service Workers.');

        // 1. Unregister all existing service workers (optional but ensures a clean slate)
        //    This loop iterates over all registrations and unregisters them.
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            if (registrations.length > 0) {
                console.log(`Service Worker: Found ${registrations.length} existing registrations. Unregistering...`);
                await Promise.all(registrations.map(async (registration, index) => {
                    if (registration && registration.active) {
                        console.log(`Service Worker: Unregistering existing SW ${index + 1} at scope: ${registration.scope}`);
                        await registration.unregister();
                        console.log(`Service Worker: Unregistered successfully for scope: ${registration.scope}`);
                    } else if (registration) {
                        console.log(`Service Worker: Found waiting/installing SW ${index + 1} at scope: ${registration.scope}. Unregistering...`);
                        await registration.unregister();
                        console.log(`Service Worker: Unregistered successfully for scope: ${registration.scope}`);
                    }
                }));
                console.log('Service Worker: All existing service workers unregistered.');
            } else {
                console.log('Service Worker: No existing service worker registrations found.');
            }
        } catch (error) {
            console.error('Service Worker: Error during unregistration process:', error);
            // Don't stop here, try to register anyway
        }

        // 2. Register the new service worker
        try {
            console.log(`Service Worker: Attempting to register ${SERVICE_WORKER_PATH}...`);
            const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
                // You can add a scope option here if your service worker is not at the root
                // scope: '/'
            });

            console.log('Service Worker: Registered successfully with scope:', registration.scope);

            // Optional: Listen for controller changes (useful for knowing when the SW takes control)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker: Controller changed - new service worker is active!');
                // You might want to reload the page here to ensure all assets are served by the new SW
                // window.location.reload(); // Use with extreme caution, can lead to reload loops
            });

        } catch (error) {
            console.error('Service Worker: Registration failed:', error);
        }

    } else {
        console.log('Service Worker: Browser does not support Service Workers.');
    }
}
registerServiceWorker()