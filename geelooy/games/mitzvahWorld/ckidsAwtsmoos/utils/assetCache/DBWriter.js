
import DBConnection from './DBConnection.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * B"H
 * @class DBWriter
 * @description
 * ==============================================================================
 * 🖋️ THE SCRIBE OF REALITY (SOFER) 🖋️
 * ==============================================================================
 * When new light pours down from the heavenly servers into our application, 
 * we must capture it within physical letters (data arrays). The DBWriter
 * ensures that the physical Blob—which holds the digital equivalent of
 * atomic structures—is stamped irrevocably into the browser's lower realms.
 */
export default class DBWriter {
    /**
     * @method put
     * @description 
     * Binds a blob of data into the persistence array.
     * @param {string} url - The name it shall be called by forever.
     * @param {Blob} blob - The unshaped plasma of data.
     * @returns {Promise<void>}
     */
    static async put(url, blob) {
        const db = await DBConnection.init();
        if (!db) return;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(DBConnection.STORE_NAME, 'readwrite');
                const store = tx.objectStore(DBConnection.STORE_NAME);
                const req = store.put(blob, url);
                
                req.onsuccess = () => resolve();
                req.onerror = (e) => {
                    console.warn("B\"H - The vessels are too narrow! (Storage Quota exceeded?):", e);
                    resolve(); // Still resolving cleanly so the engine continues without crashing.
                };
            } catch(e) {
                console.warn("B\"H - Scribing process violently interrupted:", e);
                resolve();
            }
        });
    }
}
