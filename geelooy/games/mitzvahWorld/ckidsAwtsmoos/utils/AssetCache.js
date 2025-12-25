
// B"H
/**
 * AssetCache.js
 * IndexedDB wrapper for caching Game Assets (Blobs).
 * Ensures assets load instantly on subsequent visits.
 */
export default class AssetCache {
    static DB_NAME = 'MitzvahWorldAssets';
    static STORE_NAME = 'blobs';
    static VERSION = 1;
    static db = null;
    static initPromise = null;

    static async init() {
        if (this.db) return;
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
                resolve();
            };
            
            req.onerror = (e) => {
                console.warn("B\"H - AssetCache IndexedDB Error:", e);
                resolve(); // Resolve anyway to allow fallback to network
            };
        });
        
        return this.initPromise;
    }

    static async get(url) {
        await this.init();
        if (!this.db) return null;

        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction(this.STORE_NAME, 'readonly');
                const store = tx.objectStore(this.STORE_NAME);
                const req = store.get(url);
                
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            } catch(e) {
                console.warn("B\"H - AssetCache Get Error:", e);
                resolve(null);
            }
        });
    }

    static async put(url, blob) {
        await this.init();
        if (!this.db) return;

        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
                const store = tx.objectStore(this.STORE_NAME);
                const req = store.put(blob, url);
                
                req.onsuccess = () => resolve();
                req.onerror = (e) => {
                    console.warn("B\"H - AssetCache Write Error (Quota?):", e);
                    resolve();
                };
            } catch(e) {
                console.warn("B\"H - AssetCache Put Error:", e);
                resolve();
            }
        });
    }

    static async delete(url) {
        await this.init();
        if (!this.db) return;

        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
                const store = tx.objectStore(this.STORE_NAME);
                const req = store.delete(url);
                
                req.onsuccess = () => {
                    console.log(`B"H - AssetCache: Deleted ${url}`);
                    resolve();
                };
                req.onerror = (e) => {
                    console.warn("B\"H - AssetCache Delete Error:", e);
                    resolve();
                };
            } catch(e) {
                console.warn("B\"H - AssetCache Delete Exception:", e);
                resolve();
            }
        });
    }
}
