
// B"H
import ConnectionSeer from './AssetCache/ConnectionSeer.js';
import MemoryExtractor from './AssetCache/MemoryExtractor.js';
import MemoryInscriber from './AssetCache/MemoryInscriber.js';
import MemoryPurge from './AssetCache/MemoryPurge.js';

/**
 * @class AssetCache
 * @description
 * ==============================================================================
 * 🌍 THE TENT OF GATHERING (MISHKAN) 🌍
 * ==============================================================================
 * Previously, this single structure contained the full mechanics of the universe,
 * rendering it a monolithic block that collapsed under its own weight during URL routing.
 * 
 * We have totally reconstructed it into sub-vessels (Files) mirroring the Tree of Life.
 * This class now simply binds to the Olam API so `loading.js` does not suffer 
 * unexpected shattering (TypeError missing default exports).
 * 
 * By importing here, anything in `/ckidsAwtsmoos/Olam/methods/loading.js` safely resolves
 * to the `AssetCache` name via pure function exposure.
 */
export default class AssetCache {
    /** 
     * @returns {Promise<IDBDatabase|null>}
     */
    static async init() {
        return await ConnectionSeer.establish();
    }
    
    /** 
     * @param {string} url
     * @returns {Promise<Blob|null>} 
     */
    static async get(url) {
        return await MemoryExtractor.retrieve(url);
    }
    
    /** 
     * @param {string} url
     * @param {Blob} blob
     * @returns {Promise<void>} 
     */
    static async put(url, blob) {
        return await MemoryInscriber.write(url, blob);
    }
    
    /** 
     * @param {string} url
     * @returns {Promise<void>} 
     */
    static async delete(url) {
        return await MemoryPurge.eradicate(url);
    }
}
