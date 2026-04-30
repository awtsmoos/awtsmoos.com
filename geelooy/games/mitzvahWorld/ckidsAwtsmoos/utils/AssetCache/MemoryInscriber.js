
// B"H
import ConnectionSeer from './ConnectionSeer.js';
import { ASSET_CACHE_SEFIROT } from './Constants.js';

/**
 * @class MemoryInscriber
 * @description
 * 
 * Chapter 4: The Inscription on the Tablets (Hod)
 * Splendour manifests when things last beyond a single fleeting breath!
 * "The words of Our G-d are eternal." We solidify the downloaded array buffers 
 * into the local hardware by carving them perfectly into the disk drive.
 */
export default class MemoryInscriber {
    /**
     * @method write
     * @description Merges a URL and a physical Blob into eternal bond.
     * @param {string} locatorUrl 
     * @param {Blob} holyPlasma 
     * @returns {Promise<void>}
     */
    static async write(locatorUrl, holyPlasma) {
        const memoryPalace = await ConnectionSeer.establish();
        if (!memoryPalace) return;

        return new Promise((resolve) => {
            try {
                const transaction = memoryPalace.transaction(ASSET_CACHE_SEFIROT.STORE_NAME, 'readwrite');
                const vault = transaction.objectStore(ASSET_CACHE_SEFIROT.STORE_NAME);
                const insertion = vault.put(holyPlasma, locatorUrl);
                
                insertion.onsuccess = () => resolve();
                insertion.onerror = (e) => {
                    console.warn(`B"H - The container cannot hold the infinite light! Quota exceeded?`, e);
                    resolve(); // Safely exit without detonating the engine
                };
            } catch(e) {
                console.warn(`B"H - ⚠️ Writing failed at the foundation level.`, e);
                resolve();
            }
        });
    }
}
