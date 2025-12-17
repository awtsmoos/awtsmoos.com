
// B"H
(function(root) {
    root.MerkavaMemory = root.MerkavaMemory || {};
    const IDBAdapter = root.MerkavaMemory.IDBAdapter;
    const DB_CONFIG = root.MerkavaMemory.DB_CONFIG;

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
            if (typeof ptr !== 'number') throw new Error(`[VMM] Invalid Pointer: ${String(ptr)}`);
            if (!Number.isInteger(ptr) || ptr >= this.nextPtr) throw { type: "PRIMITIVE_ACCESS", value: ptr };

            if (this.ram.has(ptr)) {
                const val = this.ram.get(ptr);
                this.ram.delete(ptr); 
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
            
            // Debug Log for Canvas Storage attempts
            if (newValue && (newValue.toString().includes("Canvas") || newValue.constructor.name === "OffscreenCanvas")) {
                console.log(`[VMM] Storing Canvas-like object at Ptr ${ptr}. Type: ${newValue.constructor.name}`);
            }

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
            if (this.ram.size > this.maxRamObjects) this._evictIfNeeded();
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
                    if (this.dirtySet.has(ptr)) batch.push({ key: ptr, value });
                    keysToDelete.push(ptr);
                }
                if (batch.length > 0) {
                    try {
                        await this.db.putBatch(DB_CONFIG.STORE_HEAP, batch);
                    } catch (e) {
                        if (e.name === 'DataCloneError') {
                            console.warn("[VMM] Eviction DataCloneError encountered. Attempting to pin non-persistable objects.");
                            for (const item of batch) {
                                try { await this.db.put(DB_CONFIG.STORE_HEAP, item.key, item.value); } 
                                catch (innerErr) { 
                                    if (innerErr.name === 'DataCloneError') { 
                                        console.log(`[VMM] Pinned object at Ptr ${item.key} (Cannot persist).`);
                                        pinnedPtrs.add(item.key); 
                                        this.dirtySet.delete(item.key); 
                                    } 
                                }
                            }
                        } else throw e;
                    }
                }
                for (const ptr of keysToDelete) {
                    if (pinnedPtrs.has(ptr)) continue;
                    this.ram.delete(ptr);
                    this.dirtySet.delete(ptr);
                }
                await this.db.put(DB_CONFIG.STORE_META, "root_state", { nextPtr: this.nextPtr });
            } catch (e) { console.error("[VMM] Eviction Failure:", e); } 
            finally { this.isEvicting = false; }
        }

        async flush() {
            const batch = [];
            for (const ptr of this.dirtySet) {
                if (this.ram.has(ptr)) batch.push({ key: ptr, value: this.ram.get(ptr) });
            }
            if (batch.length > 0) {
                try { await this.db.putBatch(DB_CONFIG.STORE_HEAP, batch); } 
                catch (e) { if (e.name === 'DataCloneError') console.warn("[VMM] Flush warning: Non-persistable objects skipped."); }
            }
            try { await this.db.put(DB_CONFIG.STORE_META, "root_state", { nextPtr: this.nextPtr }); } catch(e) {}
            this.dirtySet.clear();
        }
    }

    root.MerkavaMemory.MemoryManager = MemoryManager;
    root.MerkavaMemory.isPageFault = (e) => e && e.type === "PAGE_FAULT";
})(typeof self !== 'undefined' ? self : this);
