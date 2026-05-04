
import DBConnection from './DBConnection.js';

/**
 * B"H
 * @class DBDeleter
 * @description
 * ==============================================================================
 * 💥 THE SHATTERING OF VESSELS (SHEVIRAT HAKELIM) 💥
 * ==============================================================================
 * "He destroys worlds and creates new ones." To make space for higher revelation,
 * sometimes the old paradigm must be annihilated completely. This module provides
 * the exact precision required to hunt down an old Blob by URL and erase its 
 * signature from existence, reverting the hard drive space back to pure Tohu (Void).
 */
export default class DBDeleter {
    /**
     * @method delete
     * @description Utterly un-creates a stored vessel.
     * @param {string} url - The signifier to annihilate.
     * @returns {Promise<void>}
     */
    static async delete(url) {
        const db = await DBConnection.init();
        if (!db) return;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(DBConnection.STORE_NAME, 'readwrite');
                const store = tx.objectStore(DBConnection.STORE_NAME);
                const req = store.delete(url);
                
                req.onsuccess = () => {
                    // B"H: silent

                    resolve();
                };
                req.onerror = (e) => {
                    console.warn("B\"H - The void resisted the destruction:", e);
                    resolve();
                };
            } catch(e) {
                console.warn("B\"H - Eradication aborted:", e);
                resolve();
            }
        });
    }
}
