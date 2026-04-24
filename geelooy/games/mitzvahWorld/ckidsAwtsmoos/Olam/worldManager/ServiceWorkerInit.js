
/**
 * B"H
 * @module ServiceWorkerInit
 * @description
 * The grand protector of the cache. Ensures that once the speech of creation descends, 
 * it is stored locally, defying the lack of an internet connection.
 */
export default {
    /**
     * @async
     * @function registerServiceWorker
     * @param {string} workerPath 
     */
    async registerServiceWorker(workerPath) {
        try {
            var registration = await navigator.serviceWorker.register(workerPath);
            console.log('Service Worker Registered', registration);
        } catch (e) {
            console.log('Service Worker Registration Failed', e);
        }
    }
};
