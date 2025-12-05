// B"H
/**
 * @file merkava-memory.js
 * @version 1.0.1 - The Infinite Archive
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MerkavaMemory = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

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

    class MemoryManager {
        constructor(maxRamObjects = 1000) {
            this.db = new IDBAdapter();
            this.ram = new Map(); 
            this.dirtySet = new Set();
            this.nextPtr = 1; 
            this.maxRamObjects = maxRamObjects;
            this.isReady = false;
        }

        async init() {
            try {
                const meta = await this.db.get(DB_CONFIG.STORE_META, "root_state");
                if (meta) {
                    this.nextPtr = meta.nextPtr;
                }
                this.isReady = true;
            } catch (e) {
                console.error("[VMM] Init Failed", e);
                throw e;
            }
        }

        get(ptr) {
            if (ptr === 0 || ptr === null || ptr === undefined) return null; 
            
            if (typeof ptr !== 'number') {
                throw new Error(`[VMM] Segmentation Fault: Invalid Pointer Access (${String(ptr)})`);
            }

            if (!Number.isInteger(ptr) || ptr >= this.nextPtr) {
                throw { type: "PRIMITIVE_ACCESS", value: ptr };
            }

            if (this.ram.has(ptr)) {
                const val = this.ram.get(ptr);
                this.ram.delete(ptr); // Refresh LRU
                this.ram.set(ptr, val);
                return val;
            }

            throw { type: "PAGE_FAULT", ptr: ptr };
        }

        allocate(value) {
            const ptr = this.nextPtr++;
            this.ram.set(ptr, value);
            this.dirtySet.add(ptr);
            this._checkEviction();
            return ptr;
        }

        set(ptr, newValue) {
            if (ptr === 0) throw new Error("[VMM] Segmentation Fault: Cannot write to NULL (0)");
            this.ram.set(ptr, newValue);
            this.dirtySet.add(ptr);
            this._checkEviction();
        }

        async resolveFault(ptr) {
            const val = await this.db.get(DB_CONFIG.STORE_HEAP, ptr);
            if (val === undefined) {
                console.error(`[VMM] Access Violation: Pointer ${ptr} does not exist on disk.`);
                return false; 
            }
            this.ram.set(ptr, val);
            await this._evictIfNeeded();
            return true;
        }

        _checkEviction() {
            if (this.ram.size > this.maxRamObjects) {
                this._evictIfNeeded();
            }
        }

        async _evictIfNeeded() {
            if (this.isEvicting) return;
            this.isEvicting = true;

            try {
                const toEvictCount = this.ram.size - this.maxRamObjects;
                if (toEvictCount <= 0) return;

                const batch = [];
                const keysToDelete = [];
                const pinnedPtrs = new Set();

                for (const [ptr, value] of this.ram) {
                    if (keysToDelete.length >= toEvictCount) break;
                    if (this.dirtySet.has(ptr)) {
                        batch.push({ key: ptr, value });
                    }
                    keysToDelete.push(ptr);
                }

                if (batch.length > 0) {
                    try {
                        await this.db.putBatch(DB_CONFIG.STORE_HEAP, batch);
                    } catch (e) {
                        if (e.name === 'DataCloneError') {
                            for (const item of batch) {
                                try {
                                    await this.db.put(DB_CONFIG.STORE_HEAP, item.key, item.value);
                                } catch (innerErr) {
                                    if (innerErr.name === 'DataCloneError') {
                                        pinnedPtrs.add(item.key);
                                        this.dirtySet.delete(item.key); 
                                    }
                                }
                            }
                        } else {
                            throw e;
                        }
                    }
                }

                for (const ptr of keysToDelete) {
                    if (pinnedPtrs.has(ptr)) continue;
                    this.ram.delete(ptr);
                    this.dirtySet.delete(ptr);
                }

                await this.db.put(DB_CONFIG.STORE_META, "root_state", { nextPtr: this.nextPtr });

            } catch (e) {
                console.error("[VMM] Eviction Failure:", e);
            } finally {
                this.isEvicting = false;
            }
        }

        async flush() {
            const batch = [];
            for (const ptr of this.dirtySet) {
                if (this.ram.has(ptr)) {
                    batch.push({ key: ptr, value: this.ram.get(ptr) });
                }
            }
            if (batch.length > 0) {
                try {
                    await this.db.putBatch(DB_CONFIG.STORE_HEAP, batch);
                } catch (e) {
                     if (e.name === 'DataCloneError') {
                        console.warn("[VMM] Flush warning: Some objects could not be persisted (DataCloneError).");
                    }
                }
            }
            try {
                await this.db.put(DB_CONFIG.STORE_META, "root_state", { nextPtr: this.nextPtr });
            } catch(e) {}
            
            this.dirtySet.clear();
        }
    }

    return {
        MemoryManager,
        isPageFault: (e) => e && e.type === "PAGE_FAULT"
    };
}));