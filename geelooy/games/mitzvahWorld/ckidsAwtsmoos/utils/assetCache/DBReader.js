
import DBConnection from './DBConnection.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * B"H
 * @class DBReader
 * @description
 * ==============================================================================
 * 📖 THE EXTRACTION OF THE HIDDEN LIGHT 📖
 * ==============================================================================
 * Time exists in three planes—Past, Present, and Future. But all are continuously 
 * re-created from absolute nothingness right now! When we pull an image from 
 * the cache, we are finding a "Reshimu" (an impression) left behind by a 
 * previous contraction of the Divine Will. 
 * 
 * This class reaches its hand into the Zikaron (Storage) and pulls the physical 
 * representation of that Reshimu back into the active light of consciousness!
 */
export default class DBReader {
    /**
     * @method get
     * @description 
     * Seeks an exact vessel from the shadowy index using its Holy Name (URL).
     * @param {string} url - The coordinate string in the dimension.
     * @returns {Promise<Blob|null>}
     */
    static async get(url) {
        const db = await DBConnection.init();
        if (!db) return null;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(DBConnection.STORE_NAME, 'readonly');
                const store = tx.objectStore(DBConnection.STORE_NAME);
                const req = store.get(url);
                
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            } catch(e) {
                console.warn("B\"H - The retrieval array was blocked by physical constraints:", e);
                resolve(null);
            }
        });
    }
}
