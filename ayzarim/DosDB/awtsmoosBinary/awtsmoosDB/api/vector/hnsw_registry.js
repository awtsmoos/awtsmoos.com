// B"H
/**
 * @file hnsw_registry.js
 * @description
 *  Synchronous Registry for HNSW Nodes.
 *  Handles the 'Registry List' and 'Node Cache'.
 */
const SmartPointer = require('../../utils/smartPointer.js');

class HNSWRegistry {
    constructor(hnsw, listHandle) {
        this.hnsw = hnsw;
        this.handle = listHandle;
        this.cache = new Map();
        this.CACHE_LIMIT = 500; // Small cache
        this._ptrs = [];
    }

    init() {
        if (this._ptrs.length > 0) return;
        
        // Sync read of all pointers in list
        // Iterating list handle synchronously
        try {
            for (const ptr of this.handle) {
                this._ptrs.push(ptr); // Buffer
            }
        } catch(e) { /* empty list */ }
    }

    count() { return this._ptrs.length; }

    getNode(id) {
        if (id < 0 || id >= this._ptrs.length) return null;
        if (this.cache.has(id)) return this.cache.get(id);
        
        const ptr = this._ptrs[id];
        const node = this.hnsw.storage.loadNode(ptr);
        
        if (node) {
            this._cache(id, node);
        }
        return node;
    }

    saveNode(node) {
        const ptr = this.hnsw.storage.saveNode(node);
        node.ptr = ptr; // update memory
        this._cache(node.id, node);
        return ptr;
    }

    addPtr(id, ptr) {
        this._ptrs[id] = ptr;
        // Write to list handle synchronously
        // Ensure list length logic matches
        if (id >= this.handle.length) {
            this.handle.push(ptr);
        } else {
            this.handle[id] = ptr; // setter
        }
    }

    _cache(id, node) {
        if (this.cache.size >= this.CACHE_LIMIT) {
            const key = this.cache.keys().next().value;
            this.cache.delete(key);
        }
        this.cache.set(id, node);
    }
}

module.exports = HNSWRegistry;