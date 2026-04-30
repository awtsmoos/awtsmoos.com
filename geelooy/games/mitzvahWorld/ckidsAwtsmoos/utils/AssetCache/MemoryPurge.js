
// B"H
import ConnectionSeer from './ConnectionSeer.js';
import { ASSET_CACHE_SEFIROT } from './Constants.js';

/**
 * @class MemoryPurge
 * @description
 * 
 * Chapter 5: The Shattering of Vessels (Shevirat HaKelim)
 * Sometimes a reality is flawed, or an old universe must pass to make way 
 * for the new Heavens and new Earth. The power of Delete (Gevurah/Severity)
 * destroys the target precisely and completely.
 */
export default class MemoryPurge {
    /**
     * @method eradicate
     * @description Dissolves a memory trace, returning its allocated matter to Ayin (Void).
     * @param {string} locatorUrl 
     * @returns {Promise<void>}
     */
    static async eradicate(locatorUrl) {
        const memoryPalace = await ConnectionSeer.establish();
        if (!memoryPalace) return;

        return new Promise((resolve) => {
            try {
                const transaction = memoryPalace.transaction(ASSET_CACHE_SEFIROT.STORE_NAME, 'readwrite');
                const vault = transaction.objectStore(ASSET_CACHE_SEFIROT.STORE_NAME);
                const destruction = vault.delete(locatorUrl);
                
                destruction.onsuccess = () => {
                    console.log(`B"H - 🗑️ Matter at ${locatorUrl} was un-created. Returned to Nothingness.`);
                    resolve();
                };
                destruction.onerror = (e) => {
                    console.warn(`B"H - ⚠️ Erasure countered by unforeseen resistance.`, e);
                    resolve();
                };
            } catch(e) {
                console.warn(`B"H - ⚠️ Destructive command failed dynamically.`, e);
                resolve();
            }
        });
    }
}
