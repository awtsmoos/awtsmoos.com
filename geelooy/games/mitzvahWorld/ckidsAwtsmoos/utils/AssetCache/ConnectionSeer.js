
// B"H
import { ASSET_CACHE_SEFIROT } from './Constants.js';

/**
 * @class ConnectionSeer
 * @description
 * 
 * Chapter 2: Establishing the Divine Flow (Da'as)
 * Before a memory (Reshimu) can be stored, the mind must be prepared to receive it.
 * This class establishes an asynchronous pipeline into the browser's persistent state.
 * Just as all biological and inorganic matter contains the permutations of Hebrew
 * letters bringing them to life right now, the very database object `IDBDatabase` 
 * is birthed from the Word!
 */
export default class ConnectionSeer {
    static activeConnection = null;
    static initializationPromise = null;

    /**
     * @method establish
     * @description Utters the handshake that opens the gates of Zikaron (Memory).
     * @returns {Promise<IDBDatabase|null>}
     */
    static async establish() {
        if (this.activeConnection) return this.activeConnection;
        if (this.initializationPromise) return this.initializationPromise;

        this.initializationPromise = new Promise((resolve) => {
            const req = indexedDB.open(ASSET_CACHE_SEFIROT.DB_NAME, ASSET_CACHE_SEFIROT.VERSION);
            
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Only create the chamber if it has not yet emanated into existence
                if (!db.objectStoreNames.contains(ASSET_CACHE_SEFIROT.STORE_NAME)) {
                    db.createObjectStore(ASSET_CACHE_SEFIROT.STORE_NAME);
                }
            };
            
            req.onsuccess = (e) => {
                this.activeConnection = e.target.result;
                resolve(this.activeConnection);
            };
            
            req.onerror = (e) => {
                console.warn(`B"H - The structural void rejected the connection:`, e);
                // Return null so the Engine degrades gracefully without shattering entirely
                resolve(null); 
            };
        });
        
        return this.initializationPromise;
    }
}
