
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
            await this.db.createList(sysVector, regPath);
            
            const mapPath = `__map_${path.replace(/\./g, '_')}`;
            await this.db.createMap(sysVector, mapPath);

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
            await idx.registryHandle.ensureResolved(true);
            await idx.keyMap.ensureResolved(true);
            return idx;
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
        
        await registryHandle.ensureResolved(true);
        await mapHandle.ensureResolved(true);
        
        if (!registryHandle.ptr) {
             if (this.db.debug) console.warn(`B"H VectorManager: Registry ${meta.regPath} missing (Ptr Null). Corruption possible.`);
             return null;
        }

        const hnsw = new HNSW(this.db, registryHandle, mapHandle, meta);
        
        const originalInsert = hnsw.insert.bind(hnsw);
        hnsw.insert = async (key, vec, payload) => {
            const oldEntryID = hnsw.meta.entryNodeID;
            const res = await originalInsert(key, vec, payload);
            if (oldEntryID !== hnsw.meta.entryNodeID) {
                meta.entryNodeID = hnsw.meta.entryNodeID;
                await sysVector.set(path, meta);
            }
            return res;
        };

        const originalDelete = hnsw.delete.bind(hnsw);
        hnsw.delete = async (key) => {
            const oldEntryID = hnsw.meta.entryNodeID;
            await originalDelete(key);
            if (oldEntryID !== hnsw.meta.entryNodeID) {
                if (this.db.debug) console.log(`B"H VectorManager: Persisting new Entry Node ID: ${hnsw.meta.entryNodeID}`);
                meta.entryNodeID = hnsw.meta.entryNodeID;
                await sysVector.set(path, meta);
            }
        };

        this.indexes.set(path, hnsw);
        return hnsw;
    }

    async insert(path, key, vector, payload) {
        this.db._pendingIndexOps.push(async () => {
            try {
                const index = await this.getIndex(path);
                if (!index) return;
                let vec = vector;
                if (Array.isArray(vector)) vec = new Float32Array(vector);
                await index.insert(key, vec, payload);
            } catch(e) {
                console.error("B\"H Background Vector Insert Failed:", e);
            }
        });
    }

    async delete(path, key) {
        this.db._pendingIndexOps.push(async () => {
            try {
                const index = await this.getIndex(path);
                if (!index) return;
                await index.delete(key);
            } catch(e) {
                console.error("B\"H Background Vector Delete Failed:", e);
            }
        });
    }

    async nearest(handle, queryVector, k = 5) {
        await this.db._flushBackgroundTasks();

        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        const path = h.getPath ? h.getPath() : handle; 

        const index = await this.getIndex(path);
        if (!index) {
             return [];
        }
        
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
    }

    async reindex(path) {
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
                
                await index.insert(keyStr, v, stablePtr);
            }
            count++;
        }
        
        await index.flushCache();
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
