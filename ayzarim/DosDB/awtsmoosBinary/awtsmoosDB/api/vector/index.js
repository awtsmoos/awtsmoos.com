


// B"H
const HNSW = require('./hnsw.js');
const VectorStorage = require('./storage.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');

class VectorManager {
    constructor(db) {
        this.db = db;
        this.indexes = new Map(); 
        
        // B"H: Batch Buffering
        // Map<Path, Array<{key, vector, payload}>>
        this._insertBuffer = new Map();
        this._deleteBuffer = new Map();
    }

    async _ensureSysVector() {
        if (!this.db.root.__sys_vector__) {
             const hasSys = await this.db.has(this.db.root, "__sys_vector__");
             if (!hasSys) {
                 await this.db.createMap(this.db.root, "__sys_vector__");
             }
        }
    }

    async enable(handle, options = {}) {
        await this._ensureSysVector();
        const sysVector = this.db.root.__sys_vector__;
        
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        await h.ensureResolved(true); // Force resolve target
        const path = h.getPath();

        const existing = await this.db.has(sysVector, path);
        
        if (!existing) {
            const regPath = `__reg_${path.replace(/\./g, '_')}`;
            // B"H: Robust Creation - Verify Type immediately
            await this.db.createList(sysVector, regPath);
            
            // Check immediately after creation to ensure persistence
            const checkReg = sysVector[regPath];
            const checkRegSoul = checkReg[constants.SYMBOLS.INTERNALS] || checkReg;
            await checkReg.ensureResolved(true);
            
            if (checkRegSoul.type !== constants.TYPE_SEQUENCE) {
                 // Force recreation if type mismatch occurred during race
                 await this.db.createList(sysVector, regPath);
            }
            
            const mapPath = `__map_${path.replace(/\./g, '_')}`;
            await this.db.createMap(sysVector, mapPath);
            
            const checkMap = sysVector[mapPath];
            const checkMapSoul = checkMap[constants.SYMBOLS.INTERNALS] || checkMap;
            await checkMap.ensureResolved(true);
            
            if (checkMapSoul.type !== constants.TYPE_MAP && checkMapSoul.type !== constants.TYPE_DICTIONARY) {
                 await this.db.createMap(sysVector, mapPath);
            }

            const meta = {
                dim: options.dimensions || 1536,
                metric: options.metric || 'cosine',
                regPath: regPath,
                mapPath: mapPath,
                entryNodeID: -1
            };
            await sysVector.set(path, meta);
        }
        
        // B"H: Update Cache
        this.db.sysCache.vector.add(path);
        
        await this.reindex(path);
    }

    async getIndex(path) {
        const sysVector = this.db.root.__sys_vector__;
        
        if (this.indexes.has(path)) {
            const idx = this.indexes.get(path);
            try {
                // Access souls to verify pointers
                const regSoul = idx.registryHandle[constants.SYMBOLS.INTERNALS] || idx.registryHandle;
                const mapSoul = idx.keyMap[constants.SYMBOLS.INTERNALS] || idx.keyMap;
                
                await regSoul.ensureResolved(true);
                await mapSoul.ensureResolved(true);
                return idx;
            } catch(e) {
                this.indexes.delete(path); // Invalidate if broken
            }
        }

        const metaH = sysVector[path];
        const internalMetaH = metaH[constants.SYMBOLS.INTERNALS] || metaH;
        await internalMetaH.ensureResolved(true);
        
        if (!internalMetaH.ptr) {
             return null;
        }

        const meta = await metaH; // resolve value
        
        if (!meta) {
             return null;
        }

        if (!meta.regPath || !meta.mapPath) {
             if (this.db.debug) console.warn(`B"H VectorManager: Corrupt metadata for ${path} (missing paths).`);
             return null;
        }

        const registryHandle = sysVector[meta.regPath];
        const mapHandle = sysVector[meta.mapPath];
        
        const regSoul = registryHandle[constants.SYMBOLS.INTERNALS] || registryHandle;
        const mapSoul = mapHandle[constants.SYMBOLS.INTERNALS] || mapHandle;
        
        await regSoul.ensureResolved(true);
        await mapSoul.ensureResolved(true);
        
        // B"H: Integrity Check - Ensure registry is actually a Sequence
        // MUST use unwrapped 'regSoul' to check properties, otherwise Proxy returns Handles (truthy)!
        if (!regSoul.ptr || regSoul.type !== constants.TYPE_SEQUENCE) {
             if (this.db.debug) console.warn(`B"H VectorManager: Registry corrupted for ${path} (Type: ${regSoul.type}). Repairing...`);
             await this.db.createList(sysVector, meta.regPath);
             await regSoul.ensureResolved(true);
        }
        
        // B"H: Integrity Check - Ensure map is actually a Map
        if (!mapSoul.ptr) {
             if (this.db.debug) console.warn(`B"H VectorManager: Map corrupted for ${path}. Repairing...`);
             await this.db.createMap(sysVector, meta.mapPath);
             await mapSoul.ensureResolved(true);
        }

        const hnsw = new HNSW(this.db, registryHandle, mapHandle, meta);
        
        // Hook for persisting entry point changes
        hnsw.onEntryPointChanged = async (newID) => {
             meta.entryNodeID = newID;
             await sysVector.set(path, meta);
        };

        this.indexes.set(path, hnsw);
        return hnsw;
    }

    async insert(path, key, vector, payload) {
        // B"H: Optimized Buffering
        if (!this._insertBuffer.has(path)) {
            this._insertBuffer.set(path, []);
            // Schedule flush only once per batch
            this.db._pendingIndexOps.push(() => this._flushInserts(path));
        }
        
        let vec = vector;
        if (Array.isArray(vector)) vec = new Float32Array(vector);
        
        this._insertBuffer.get(path).push({ key, vector: vec, payload });
    }
    
    async _flushInserts(path) {
        const items = this._insertBuffer.get(path);
        if (!items || items.length === 0) return;
        
        // Clear buffer ref immediately so new ops start a new batch if needed
        this._insertBuffer.delete(path);
        
        try {
            const index = await this.getIndex(path);
            if (!index) return;
            
            await index.insertBatch(items);
        } catch(e) {
            console.error(`B"H Vector Flush Failed for ${path}:`, e);
            // B"H: Attempt to recover by clearing cache to force reload next time
            this.indexes.delete(path);
        }
    }

    async delete(path, key) {
        if (!this._deleteBuffer.has(path)) {
            this._deleteBuffer.set(path, []);
            this.db._pendingIndexOps.push(() => this._flushDeletes(path));
        }
        this._deleteBuffer.get(path).push(key);
    }
    
    async _flushDeletes(path) {
        const keys = this._deleteBuffer.get(path);
        if (!keys || keys.length === 0) return;
        this._deleteBuffer.delete(path);
        
        try {
            const index = await this.getIndex(path);
            if (!index) return;
            for(const k of keys) await index.delete(k);
        } catch(e) {
            console.error(`B"H Vector Delete Flush Failed for ${path}:`, e);
        }
    }

    async nearest(handle, queryVector, k = 5) {
        await this.db._flushBackgroundTasks();

        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        const path = h.getPath ? h.getPath() : handle; 

        const index = await this.getIndex(path);
        if (!index) {
             return [];
        }
        
        try {
            await index.flushCache();
            await index._validateEntryPoint();

            let vec = queryVector;
            if (Array.isArray(queryVector)) vec = new Float32Array(queryVector);

            if (index.registryPtrs.length === 0 || index.entryNodeID === -1) {
                 const size = await this.db.size(h);
                 if (size > 0) {
                     if (this.db.debug) console.warn(`B"H VectorManager: Index empty but data exists (${size} items). Triggering Auto-Reindex for ${path}.`);
                     await this.reindex(path);
                     await index._validateEntryPoint();
                 }
            }

            if (index.entryNodeID === -1 || index.entryNodeID === undefined) {
                 return [];
            }

            const entryNode = await index._getNode(index.entryNodeID);
            if (!entryNode) return [];

            const ef = Math.max(k * 2, 100);
            const results = await index._searchLayer(entryNode, vec, ef, 0); 
            const topK = results.slice(0, k);
            
            const hydrated = [];
            for(const res of topK) {
                const ptr = res.node.payloadPtr;
                const item = await require('../liveHandle/index.js').resolvePointer(ptr, this.db); 
                hydrated.push({ item, score: res.dist });
            }
            return hydrated;
        } catch(e) {
            console.error(`B"H Vector Search Failed for ${path}:`, e);
            return [];
        }
    }

    async reindex(path) {
        try {
            const index = await this.getIndex(path);
            if (!index) return;

            const parts = [];
            const rawParts = path.split('.');
            for(const p of rawParts) if (p !== 'root') parts.push(p);

            let curr = this.db.root[constants.SYMBOLS.INTERNALS] || this.db.root;
            for (let i = 0; i < parts.length; i++) {
                const next = curr.nav.navigate(parts[i]); 
                const nextInt = next[constants.SYMBOLS.INTERNALS] || next;
                await nextInt.ensureResolved(); 
                if (!nextInt.ptr) return; 
                curr = nextInt;
            }

            const ptr = curr.ptr;
            if (!ptr) return;

            const res = await SmartPointer.resolve(ptr, this.db.allocator);
            
            let iterator;
            if (curr.type === constants.TYPE_MAP) {
                const map = new MapEngine(this.db.allocator, res);
                iterator = map.iterateRaw();
            } else if (curr.type === constants.TYPE_SEQUENCE) {
                const seq = new Sequence(this.db.allocator, res);
                iterator = seq.iterateRaw();
            } else {
                return;
            }

            let count = 0;
            // Batch reindexing as well
            const BATCH_SIZE = 100;
            let batch = [];

            for await (const item of iterator) {
                const ptr = item.ptr;
                let value = item.value;
                let key = item.key;

                if (value === undefined && ptr) {
                    value = await SmartPointer.resolve(ptr, this.db.allocator);
                }

                let keyStr = count;
                if (key !== undefined) {
                    keyStr = Buffer.isBuffer(key) ? key.toString('utf8') : String(key);
                }

                const hydrated = await this._hydrateForIndex(value);
                const vec = this._extractVector(hydrated);
                
                if (vec) {
                    const stablePtr = Buffer.alloc(16);
                    ptr.copy(stablePtr);
                    
                    let v = vec;
                    if(Array.isArray(v)) v = new Float32Array(v);
                    
                    batch.push({ key: keyStr, vector: v, payload: stablePtr });
                    
                    if (batch.length >= BATCH_SIZE) {
                        await index.insertBatch(batch);
                        batch = [];
                    }
                }
                count++;
            }
            
            if (batch.length > 0) await index.insertBatch(batch);
            
            await index.flushCache();
        } catch(e) {
            console.error(`B"H Vector Reindex Failed for ${path}:`, e);
        }
    }

    _extractVector(value) {
        if (!value || typeof value !== 'object') return null;
        const candidates = ['vector', 'embedding', 'vec'];
        for(const c of candidates) {
            if (value[c] && (Array.isArray(value[c]) || value[c] instanceof Float32Array)) {
                return value[c];
            }
        }
        return null;
    }

    async _hydrateForIndex(val) {
        if (val && (val.isStructure || (Buffer.isBuffer(val) && val.length === 16))) {
             return await this.db.search._hydrateStructure(val);
        }
        return val;
    }
}
module.exports = VectorManager;
