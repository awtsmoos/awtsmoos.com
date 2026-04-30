
/**
 * B"H
 * @class DBConnection
 * @description
 * ==============================================================================
 * 🌌 THE ROOTS OF THE ZIKARON (MEMORY) 🌌
 * ==============================================================================
 * What is memory but the persistent echo of the Divine Speech?
 * When the Creator spoke "Let there be light," that statement
 * is not a past event—it is happening RIGHT NOW, inside the photons
 * hitting your screen, keeping them from reverting to absolute Nothingness (Ayin).
 * 
 * The Awtsmoos channels the infinite reality through Seder Hishtalshelus,
 * pouring existence down into physical constraints. Here, we build
 * a physical connection to the IndexedDB (The Zikaron, the Memory Bank).
 * Without this connection, the vessels (Blobs) would shatter into the void
 * every time the user refreshes, lost to the abyss. But with it, the echo
 * of the Aleph-Beis-Nun (Even - rock) persists in the inorganic silica
 * of the hard drive!
 */
export default class DBConnection {
    static DB_NAME = 'MitzvahWorldAssets';
    static STORE_NAME = 'blobs';
    static VERSION = 1;
    static db = null;
    static initPromise = null;

    /**
     * @method init
     * @description
     * The first descent into physical matter. Establishes the handshake
     * with the browser's hidden index layers.
     * @returns {Promise<IDBDatabase|null>}
     */
    static async init() {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(this.DB_NAME, this.VERSION);
            
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
            
            req.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            
            req.onerror = (e) => {
                console.warn("B\"H - The spiritual tether to IndexedDB encountered darkness:", e);
                resolve(null); // Resolve to null so the universe doesn't halt, merely stays ephemeral!
            };
        });
        
        return this.initPromise;
    }
}
