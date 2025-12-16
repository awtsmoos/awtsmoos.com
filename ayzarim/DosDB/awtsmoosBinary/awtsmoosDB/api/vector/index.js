

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
        this.sysVector = null;
        this.indexes = new Map(); 
    }

    async _init() {
        if (this.sysVector) return;
        const hasSys = await this.db.root.has("__sys_vector__");
        if (!hasSys) {
            await this.db.root.createMap("__sys_vector__");
        }
        this.sysVector = this.db.root.__sys_vector__;
    }

    async enableVectorIndex(path, options = {}) {
        await this._init();
        const existing = await this.sysVector.get(path);
        
        // Always ensure meta exists
        if (!existing) {
            const regPath = `__reg_${path.replace(/\./g, '_')}`;
            await this.sysVector.createList(regPath);
            
            const mapPath = `__map_${path.replace(/\./g, '_')}`;
            await this.sysVector.createMap(mapPath);

            const meta = {
                dim: options.dimensions || 1536,
                metric: options.metric || 'cosine',
                regPath: regPath,
                mapPath: mapPath,
                entryNodeID: -1
            };
            await this.sysVector.set(path, meta);
        }
        
        // B"H: Trigger Backfill/Reindex to index any existing data
        await this.reindex(path);
    }

    async getIndex(path) {
        await this._init();
        if (this.indexes.has(path)) return this.indexes.get(path);

        const meta = await this.sysVector.get(path);
        if (!meta) return null;

        const registryHandle = this.sysVector[meta.regPath];
        const mapHandle = this.sysVector[meta.mapPath];
        
        if (!registryHandle || !mapHandle) return null;

        const hnsw = new HNSW(this.db, registryHandle, mapHandle, meta);
        
        // B"H: Wrap Insert to persist meta changes (Entry Node updates)
        const originalInsert = hnsw.insert.bind(hnsw);
        hnsw.insert = async (key, vec, payload) => {
            const oldEntryID = hnsw.meta.entryNodeID;
            const res = await originalInsert(key, vec, payload);
            if (oldEntryID !== hnsw.meta.entryNodeID) {
                meta.entryNodeID = hnsw.meta.entryNodeID;
                await this.sysVector.set(path, meta);
            }
            return res;
        };

        // B"H: Wrap Delete to persist meta changes (Entry Node updates on deletion)
        const originalDelete = hnsw.delete.bind(hnsw);
        hnsw.delete = async (key) => {
            const oldEntryID = hnsw.meta.entryNodeID;
            await originalDelete(key);
            if (oldEntryID !== hnsw.meta.entryNodeID) {
                if (this.db.debug) console.log(`B"H VectorManager: Persisting new Entry Node ID: ${hnsw.meta.entryNodeID}`);
                meta.entryNodeID = hnsw.meta.entryNodeID;
                await this.sysVector.set(path, meta);
            }
        };

        this.indexes.set(path, hnsw);
        return hnsw;
    }

    async insert(path, key, vector, payload) {
        const index = await this.getIndex(path);
        if (!index) return;
        let vec = vector;
        if (Array.isArray(vector)) vec = new Float32Array(vector);
        await index.insert(key, vec, payload);
        // B"H: Ensure immediate flush for consistency in tests
        await index.flushCache();
    }

    async delete(path, key) {
        const index = await this.getIndex(path);
        if (!index) return;
        await index.delete(key);
        // B"H: Ensure immediate flush
        await index.flushCache();
    }

    async nearest(path, queryVector, k = 5) {
        const index = await this.getIndex(path);
        if (!index) throw new Error(`Vector index not found for ${path}`);
        
        await index.flushCache();

        // B"H: Self-Healing Entry Point
        await index._validateEntryPoint();

        let vec = queryVector;
        if (Array.isArray(queryVector)) vec = new Float32Array(queryVector);

        // B"H: Check if entry node is valid
        if (index.entryNodeID === -1 || index.entryNodeID === undefined) {
             return [];
        }

        const entryNode = await index._getNode(index.entryNodeID);
        if (!entryNode) {
            if (this.db.debug) console.warn(`B"H Vector: Entry Node ${index.entryNodeID} load failed.`);
            return [];
        }

        // B"H: Increase ef_search for better recall, especially with tombstones
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

    // B"H: Backfill Logic
    async reindex(path) {
        const index = await this.getIndex(path);
        if (!index) return;

        // Traverse the data at 'path' and insert into HNSW
        // 1. Resolve Path Handle
        const parts = [];
        const rawParts = path.split('.');
        for(const p of rawParts) if (p !== 'root') parts.push(p);

        let curr = this.db.root;
        for (let i = 0; i < parts.length; i++) {
            curr = curr.get(parts[i]); 
            await curr.ensureResolved(); 
            if (!curr.ptr) return; // Path doesn't exist
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

            // B"H: If value is missing (MapEngine.iterateRaw only yields ptr), resolve it.
            if (value === undefined && ptr) {
                value = await SmartPointer.resolve(ptr, this.db.allocator);
            }

            // Normalize Key
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
        // Reuse SearchManager's hydration logic or simplified version
        if (val && (val.isStructure || (Buffer.isBuffer(val) && val.length === 16))) {
             return await this.db.search._hydrateStructure(val);
        }
        return val;
    }
}
module.exports = VectorManager;
