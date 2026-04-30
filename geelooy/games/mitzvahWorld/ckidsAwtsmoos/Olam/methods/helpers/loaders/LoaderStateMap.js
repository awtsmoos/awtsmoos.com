
/**
 * B"H
 * @class LoaderStateMap
 * @description
 * ==============================================================================
 * 🧠 THE ETERNAL MIND OF FLIGHT (KETER) 🧠
 * ==============================================================================
 * In a chaotic universe where threads and asynchronous invocations dance freely, 
 * two souls might unknowingly request the same Divine Object (GLB) from the heavens
 * at the precise identical moment. 
 * 
 * If they both reached up without awareness of each other, two redundant network 
 * manifestations would happen, destroying efficiency.
 * 
 * The LoaderStateMap is the Universal Mind that tracks all IN-FLIGHT promises.
 * When the "first request" begins the draw-down, it is etched here. Any following 
 * identical requests simply yield themselves and AWAIT the resolution of the first.
 * Utter unity in execution!
 */
export default class LoaderStateMap {
    static _gltfPromiseCache = {};

    /**
     * @method getCache
     * @description Returns the ledger of active manifestations.
     */
    static getCache() {
        return this._gltfPromiseCache;
    }

    /**
     * @method setCache
     * @description Inscribes a new path into the ledger.
     * @param {string} url 
     * @param {Promise} promise 
     */
    static setCache(url, promise) {
        this._gltfPromiseCache[url] = promise;
    }

    /**
     * @method hasCache
     * @description Checks if a path is already being manifested.
     * @param {string} url 
     * @returns {boolean}
     */
    static hasCache(url) {
        return !!this._gltfPromiseCache[url];
    }
}
