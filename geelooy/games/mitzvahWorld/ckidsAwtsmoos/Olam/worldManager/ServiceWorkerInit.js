/**
 * B"H
 * @module ServiceWorkerInit
 * @description
 * THE PURGE — Removing the intermediaries for direct emanation.
 */
export default {
    /**
     * @async
     * @function registerServiceWorker
     * @description
     * B"H: Instead of registering, we now PURGE all existing workers.
     * Direct connection to the Awtsmoos without the cache of Edom.
     */
    async registerServiceWorker() {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        } catch (e) {
            console.error('B"H - 🚨 [PURGE]: Failed to clear workers:', e);
        }
    }
};
