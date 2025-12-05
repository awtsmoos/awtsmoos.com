
// B"H
(function(root) {
    root.MerkavaMemory = root.MerkavaMemory || {};

    const DB_CONFIG = {
        NAME: "Merkava_Eternal_Storage",
        VERSION: 1,
        STORE_HEAP: "heap_objects",
        STORE_META: "vm_metadata"
    };

    class IDBAdapter {
        constructor() {
            this.db = null;
            this.initPromise = this._open();
        }

        _open() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(DB_CONFIG.STORE_HEAP)) {
                        db.createObjectStore(DB_CONFIG.STORE_HEAP); 
                    }
                    if (!db.objectStoreNames.contains(DB_CONFIG.STORE_META)) {
                        db.createObjectStore(DB_CONFIG.STORE_META);
                    }
                };
                req.onsuccess = (e) => {
                    this.db = e.target.result;
                    resolve(this.db);
                };
                req.onerror = (e) => reject(e.target.error);
            });
        }

        async get(storeName, key) {
            await this.initPromise;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(storeName, 'readonly');
                const req = tx.objectStore(storeName).get(key);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        }

        async put(storeName, key, value) {
            await this.initPromise;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(storeName, 'readwrite');
                const req = tx.objectStore(storeName).put(value, key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        }

        async putBatch(storeName, entries) {
            await this.initPromise;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                entries.forEach(({ key, value }) => store.put(value, key));
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        }
    }

    root.MerkavaMemory.IDBAdapter = IDBAdapter;
    root.MerkavaMemory.DB_CONFIG = DB_CONFIG;
})(typeof self !== 'undefined' ? self : this);
