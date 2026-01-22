// B"H
/**
 * @file index.js
 * @description 
 *  Vector Manager - Synchronous Edition.
 *  Uses `reindexer.js` to ensure data consistency on enable.
 */

const HNSW = require('./hnsw.js');
const constants = require('../../constants.js');
const VectorReindexer = require('./reindexer.js');

class VectorManager {
    constructor(db) {
        this.db = db;
        this.indexes = new Map();
        this.reindexer = new VectorReindexer(db);
    }

    _ensureSysVector() {
        if (!this.db.root.__sys_vector__) {
             // Access synchronous property to trigger hydration/check
             if (!this.db.has(this.db.root, "__sys_vector__")) {
                 this.db.root.__sys_vector__ = new this.db.Map();
             }
        }
    }

    enable(handle, options = {}) {
        this._ensureSysVector();
        const sysVector = this.db.root.__sys_vector__;
        
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        h.ensureResolved(true); 
        const path = h.getPath();

        if (!this.db.has(sysVector, path)) {
            const regPath = `__reg_${path.replace(/\./g, '_')}`;
            const mapPath = `__map_${path.replace(/\./g, '_')}`;
            
            // Allocate buckets synchronously
            sysVector[regPath] = new this.db.List();
            sysVector[mapPath] = new this.db.Map();

            const meta = {
                dim: options.dimensions || 1536,
                metric: options.metric || 'cosine',
                regPath, mapPath, entryNodeID: -1
            };
            sysVector.set(path, meta);
            
            // Wait for meta to persist so getIndex finds it
            this.db.waitForIdle();
        }
        
        this.reindex(path);
    }

    getIndex(path) {
        if (this.indexes.has(path)) return this.indexes.get(path);
        
        this._ensureSysVector();
        const sysVector = this.db.root.__sys_vector__;
        const meta = sysVector[path]; // Synchronous read
        
        if (!meta) return null;
        
        const registryHandle = sysVector[meta.regPath];
        const mapHandle = sysVector[meta.mapPath];
        
        // Defensive: Ensure handles are resolved
        const rH = registryHandle[constants.SYMBOLS.INTERNALS] || registryHandle;
        const mH = mapHandle[constants.SYMBOLS.INTERNALS] || mapHandle;
        rH.ensureResolved();
        mH.ensureResolved();

        const hnsw = new HNSW(this.db, registryHandle, mapHandle, meta);
        
        hnsw.onEntryPointChanged = (newID) => {
             meta.entryNodeID = newID; 
             // Sync Update
             sysVector.set(path, meta); 
        };
        
        this.indexes.set(path, hnsw);
        return hnsw;
    }

    insert(path, key, vector, payload) {
        const index = this.getIndex(path);
        if (index) {
            const vec = Array.isArray(vector) ? new Float32Array(vector) : vector;
            index.insert(key, vec, payload);
        }
    }

    delete(path, key) {
        const index = this.getIndex(path);
        if (index) index.delete(key);
    }

    nearest(handle, queryVector, k = 5) {
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        const path = h.getPath ? h.getPath() : handle;
        
        const index = this.getIndex(path);
        if (!index) return [];
        
        const vec = Array.isArray(queryVector) ? new Float32Array(queryVector) : queryVector;
        return index.search(vec, k);
    }

    /**
     * @description
     *  Full Synchronous Reindex.
     *  Scans the source handle and feeds data into HNSW.
     */
    reindex(path) {
        const index = this.getIndex(path);
        if (!index) return; // Index not enabled/found

        // Navigate to the handle from root to get the LiveHandle
        // (path is like "root.users.profiles")
        const parts = path.split('.').filter(p => p !== 'root');
        let current = this.db.root;
        
        for (const part of parts) {
            // Sync access
            current = current[part];
            if (!current) return; // Path broken
        }
        
        // Current is now the LiveHandle for the collection
        this.reindexer.run(path, index, current);
    }
}

module.exports = VectorManager;