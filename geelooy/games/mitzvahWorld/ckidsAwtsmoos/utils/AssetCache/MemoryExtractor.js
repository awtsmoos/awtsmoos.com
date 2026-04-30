
// B"H
import ConnectionSeer from './ConnectionSeer.js';
import { ASSET_CACHE_SEFIROT } from './Constants.js';

/**
 * @class MemoryExtractor
 * @description
 * 
 * Chapter 3: Remembering the Origin (Chochmah)
 * When a piece of physical reality (a 3D Model or Texture) needs to be formed,
 * the Awtsmoos can either download it from the distant ethereal server, or retrieve 
 * it instantaneously from local creation!
 * 
 * By mapping over the Zikaron (Storage), we pull forth pure Blobs of manifestation
 * entirely driven by data lookups rather than conditional block loops.
 */
export default class MemoryExtractor {
    /**
     * @method retrieve
     * @description Seeks the holy string (URL) and materializes the Blob attached to it.
     * @param {string} locatorUrl - The divine path identifier.
     * @returns {Promise<Blob|null>} The condensed plasma of creation.
     */
    static async retrieve(locatorUrl) {
        const memoryPalace = await ConnectionSeer.establish();
        if (!memoryPalace) return null;

        return new Promise((resolve) => {
            try {
                const transaction = memoryPalace.transaction(ASSET_CACHE_SEFIROT.STORE_NAME, 'readonly');
                const vault = transaction.objectStore(ASSET_CACHE_SEFIROT.STORE_NAME);
                const query = vault.get(locatorUrl);
                
                query.onsuccess = () => resolve(query.result || null);
                query.onerror = () => resolve(null);
            } catch(e) {
                console.warn(`B"H - 🌌 Memory Extraction collided with finite limits. Returning nothingness:`, e);
                resolve(null);
            }
        });
    }
}
