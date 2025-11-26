// B"H
/**
 * @file merkava-memory.js
 * @version 1.0.0 - The Infinite Archive
 * @description
 * The Virtual Memory Manager (VMM) for the Merkava VM.
 *
 * This module creates the illusion of infinite memory by treating the browser's RAM
 * as a cache (L1) and IndexedDB as the backing store (Swap/Disk).
 *
 * ARCHITECTURE:
 * 1. **The Heap**: A key-value store where Key = Integer Pointer, Value = JSON Object.
 * 2. **RAM Cache**: A Map holding actively used objects.
 * 3. **Page Faults**: If the VM requests a Pointer not in RAM, this module THROWS
 *    a `PageFault` interrupt. The VM loop catches this, suspends execution,
 *    awaits the data fetch from IndexedDB, and then resumes.
 * 4. **Eviction**: To maintain low RAM usage, "cold" objects are serialized to
 *    IndexedDB and removed from RAM.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MerkavaMemory = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    /**
     * @constant {string}
     * Database configuration.
     */
    const DB_CONFIG = {
        NAME: "Merkava_Eternal_Storage",
        VERSION: 1,
        STORE_HEAP: "heap_objects",
        STORE_META: "vm_metadata"
    };

    /**
     * @class IDBAdapter
     * @description Internal wrapper for raw IndexedDB operations.
     * Promises are used here, but the VM interacts synchronously until a fault occurs.
     */
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
                        db.createObjectStore(DB_CONFIG.STORE_HEAP); // Key = Ptr (Int)
                    }
                    if (!db.objectStoreNames.contains(DB_CONFIG.STORE_META)) {
                        db.createObjectStore(DB_CONFIG.STORE_META); // Key = String
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

    /**
     * @class MemoryManager
     * @description The Gatekeeper of Data.
     */
    class MemoryManager {
        /**
         * @param {number} maxRamObjects - Max number of objects to keep in RAM before evicting.
         */
        constructor(maxRamObjects = 1000) {
            this.db = new IDBAdapter();
            
            // L1 Cache: Insertion order implies LRU (Least Recently Used) in JS Maps.
            this.ram = new Map(); 
            
            // Tracking dirty objects (changed in RAM, not yet saved to Disk)
            this.dirtySet = new Set();

            // Pointers
            this.nextPtr = 1; // 0 is null
            this.maxRamObjects = maxRamObjects;

            // Metadata
            this.isReady = false;
        }

        /**
         * Initialize the memory manager.
         * Loads the last known state (nextPtr) from DB.
         */
        async init() {
            try {
                const meta = await this.db.get(DB_CONFIG.STORE_META, "root_state");
                if (meta) {
                    this.nextPtr = meta.nextPtr;
                }
                this.isReady = true;
                console.log(`[VMM] Initialized. Next Pointer: ${this.nextPtr}`);
            } catch (e) {
                console.error("[VMM] Init Failed", e);
                throw e;
            }
        }

        /**
         * @sync
         * Get an object from memory.
         * @param {number} ptr - The pointer ID.
         * @returns {object} The stored value.
         * @throws {PageFault} If data is on disk.
         */
        get(ptr) {
            if (ptr === 0 || ptr === null || ptr === undefined) return null; 
            
            if (typeof ptr !== 'number') {
                throw new Error(`[VMM] Segmentation Fault: Invalid Pointer Access (${String(ptr)})`);
            }

            // B"H - BOUNDS CHECK (THE TIKKUN)
            // If the requested ID is greater than or equal to the next available pointer,
            // it physically cannot be an allocated object. It MUST be a primitive integer (like a coordinate).
            // We throw PRIMITIVE_ACCESS so the VM can wrap it (e.g., Number(808)) and access properties safely.
            if (!Number.isInteger(ptr) || ptr >= this.nextPtr) {
                throw { type: "PRIMITIVE_ACCESS", value: ptr };
            }

            if (this.ram.has(ptr)) {
                const val = this.ram.get(ptr);
                // Refresh LRU
                this.ram.delete(ptr);
                this.ram.set(ptr, val);
                return val;
            }

            // Valid integer within bounds, but missing from RAM.
            // This is a real Page Fault (data is on Disk).
            throw { type: "PAGE_FAULT", ptr: ptr };
        }

        /**
         * @sync
         * Allocate a new object in memory.
         * Since this is a *new* object, we create it in RAM immediately.
         * No PageFault possible here.
         * 
         * @param {object} value - The JS object/array to store.
         * @returns {number} The new pointer ID.
         */
        allocate(value) {
            const ptr = this.nextPtr++;
            this.ram.set(ptr, value);
            this.dirtySet.add(ptr);
            
            this._checkEviction(); // Ensure we don't overflow RAM
            return ptr;
        }

        /**
         * @sync
         * Update an existing object.
         * 
         * @param {number} ptr - The pointer ID.
         * @param {object} newValue - The new data.
         * @throws {PageFault} If the object to update isn't in RAM (rare, but possible for partial updates).
         */
        set(ptr, newValue) {
            if (ptr === 0) throw new Error("[VMM] Segmentation Fault: Cannot write to NULL (0)");
            
            // Even for a set, we generally want it in RAM first to ensure consistency,
            // although technically we could just overwrite blindly. 
            // For safety, we treat it like a 'touch'.
            this.ram.set(ptr, newValue);
            this.dirtySet.add(ptr);
            
            this._checkEviction();
        }

        /**
         * @async
         * Resolve a PageFault.
         * This is called by the VM Host when it catches the PageFault exception.
         * 
         * @param {number} ptr - The missing pointer.
         * @returns {Promise<boolean>} True if found and loaded, False if invalid pointer.
         */
        async resolveFault(ptr) {
            // console.log(`[VMM] Resolving Page Fault for Ptr: ${ptr}`);
            const val = await this.db.get(DB_CONFIG.STORE_HEAP, ptr);
            
            if (val === undefined) {
                console.error(`[VMM] Access Violation: Pointer ${ptr} does not exist on disk.`);
                return false; // Segfault in real life
            }

            // Load into RAM
            this.ram.set(ptr, val);
            
            // We do NOT mark it dirty, as it matches the disk.
            
            // Check eviction to make room
            await this._evictIfNeeded();
            
            return true;
        }

        /**
         * @private
         * Checks RAM limits and triggers async eviction if needed.
         * Note: This is a "soft" check. We don't await it in the sync `allocate` path
         * to keep the VM fast. It runs in the background.
         */
        _checkEviction() {
            if (this.ram.size > this.maxRamObjects) {
                this._evictIfNeeded(); // Fire and forget promise
            }
        }

        /**
         * @private @async
         * Moves "Cold" objects from RAM to Disk.
         */
        /**
         * @private @async
         * Moves "Cold" objects from RAM to Disk.
         * B"H - UPDATED: Handles DataCloneError by pinning host objects to RAM.
         */
        async _evictIfNeeded() {
            if (this.isEvicting) return;
            this.isEvicting = true;

            try {
                const toEvictCount = this.ram.size - this.maxRamObjects;
                if (toEvictCount <= 0) return;

                const batch = [];
                const keysToDelete = [];
                const pinnedPtrs = new Set();

                // Iterate Map keys (Oldest/LRU first)
                for (const [ptr, value] of this.ram) {
                    if (keysToDelete.length >= toEvictCount) break;
                    if (this.dirtySet.has(ptr)) {
                        batch.push({ key: ptr, value });
                    }
                    keysToDelete.push(ptr);
                }

                // 1. Save Dirty Objects to Disk (Safely)
                if (batch.length > 0) {
                    try {
                        await this.db.putBatch(DB_CONFIG.STORE_HEAP, batch);
                    } catch (e) {
                        // If batch fails, try individually to find the non-cloneable objects
                        if (e.name === 'DataCloneError') {
                            console.warn("[VMM] Batch save hit non-cloneable data. Retrying individually...");
                            for (const item of batch) {
                                try {
                                    await this.db.put(DB_CONFIG.STORE_HEAP, item.key, item.value);
                                } catch (innerErr) {
                                    if (innerErr.name === 'DataCloneError') {
                                        // PIN this object to RAM. Do not evict.
                                        pinnedPtrs.add(item.key);
                                        this.dirtySet.delete(item.key); // Stop trying to save it
                                    }
                                }
                            }
                        } else {
                            throw e;
                        }
                    }
                }

                // 2. Remove from RAM (Evict only what was saved)
                for (const ptr of keysToDelete) {
                    if (pinnedPtrs.has(ptr)) continue; // Skip pinned objects
                    this.ram.delete(ptr);
                    this.dirtySet.delete(ptr);
                }

                // 3. Save Metadata
                await this.db.put(DB_CONFIG.STORE_META, "root_state", { nextPtr: this.nextPtr });

            } catch (e) {
                console.error("[VMM] Eviction Critical Failure:", e);
            } finally {
                this.isEvicting = false;
            }
        }

        /**
         * @async
         * Force save everything in RAM to Disk.
         * Call this before closing the browser.
         */
        async flush() {
            console.log("[VMM] Flushing RAM to Disk...");
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
                    // B"H - Silent fail for flush on non-cloneables
                    if (e.name === 'DataCloneError') {
                        console.warn("[VMM] Flush encountered non-persistable objects. Some state may not persist.");
                    } else {
                        console.error("[VMM] Flush Error:", e);
                    }
                }
            }
            try {
                await this.db.put(DB_CONFIG.STORE_META, "root_state", { nextPtr: this.nextPtr });
            } catch(e) {}
            
            this.dirtySet.clear();
            console.log("[VMM] Flush Complete.");
        }
    }

    return {
        MemoryManager,
        /** 
         * Checks if an error is a PageFault interrupt.
         * @param {Error|object} e 
         */
        isPageFault: (e) => e && e.type === "PAGE_FAULT"
    };
}));