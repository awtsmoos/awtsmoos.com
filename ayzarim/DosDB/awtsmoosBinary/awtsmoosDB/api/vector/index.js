// B"H
/**
 * @file index.js
 * @description
 *  The vector database manager. Refactored to use idiomatic assignments.
 */

const HNSW = require('./hnsw.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');

class VectorManager {
    constructor(db) {
        this.db = db;
        this.indexes = new Map(); 
        this._insertBuffer = new Map();
        this._deleteBuffer = new Map();
    }

    async _ensureSysVector() {
        if (!this.db.root.__sys_vector__) {
             const hasSys = await this.db.has(this.db.root, "__sys_vector__");
             if (!hasSys) {
                 // B"H: Marker Assignment.
                 this.db.root.__sys_vector__ = new this.db.Map();
             }
        }
    }

    async enable(handle, options = {}) {
        await this._ensureSysVector();
        const sysVector = this.db.root.__sys_vector__;
        
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        await h.ensureResolved(true); 
        const path = h.getPath();

        const existing = await this.db.has(sysVector, path);
        
        if (!existing) {
            const regPath = `__reg_${path.replace(/\./g, '_')}`;
            const mapPath = `__map_${path.replace(/\./g, '_')}`;
            
            // B"H: New assignment paradigm.
            sysVector[regPath] = new this.db.List();
            sysVector[mapPath] = new this.db.Map();

            const meta = {
                dim: options.dimensions || 1536,
                metric: options.metric || 'cosine',
                regPath, mapPath, entryNodeID: -1
            };
            await sysVector.set(path, meta);
        }
        
        this.db.sysCache.vector.add(path);
        await this.reindex(path);
    }
    // ... rest of logic preserved ...
    async getIndex(path) {
        const sysVector = this.db.root.__sys_vector__;
        if (this.indexes.has(path)) {
            const idx = this.indexes.get(path);
            try {
                await (idx.registryHandle[constants.SYMBOLS.INTERNALS] || idx.registryHandle).ensureResolved(true);
                await (idx.keyMap[constants.SYMBOLS.INTERNALS] || idx.keyMap).ensureResolved(true);
                return idx;
            } catch(e) { this.indexes.delete(path); }
        }
        const metaH = sysVector[path];
        const internalMetaH = metaH[constants.SYMBOLS.INTERNALS] || metaH;
        await internalMetaH.ensureResolved(true);
        if (!internalMetaH.ptr) return null;
        const meta = await metaH; if (!meta || !meta.regPath || !meta.mapPath) return null;
        const registryHandle = sysVector[meta.regPath];
        const mapHandle = sysVector[meta.mapPath];
        const regSoul = registryHandle[constants.SYMBOLS.INTERNALS] || registryHandle;
        const mapSoul = mapHandle[constants.SYMBOLS.INTERNALS] || mapHandle;
        await regSoul.ensureResolved(true);
        await mapSoul.ensureResolved(true);
        if (!regSoul.ptr || regSoul.type !== constants.TYPE_SEQUENCE) {
             sysVector[meta.regPath] = new this.db.List(); await regSoul.ensureResolved(true);
        }
        if (!mapSoul.ptr) {
             sysVector[meta.mapPath] = new this.db.Map(); await mapSoul.ensureResolved(true);
        }
        const hnsw = new HNSW(this.db, registryHandle, mapHandle, meta);
        hnsw.onEntryPointChanged = async (newID) => {
             meta.entryNodeID = newID; await sysVector.set(path, meta);
        };
        this.indexes.set(path, hnsw); return hnsw;
    }

    async insert(path, key, vector, payload) {
        if (!this._insertBuffer.has(path)) {
            this._insertBuffer.set(path, []);
            this.db._pendingIndexOps.push(() => this._flushInserts(path));
        }
        this._insertBuffer.get(path).push({ key, vector: Array.isArray(vector) ? new Float32Array(vector) : vector, payload });
    }
    
    async _flushInserts(path) {
        const items = this._insertBuffer.get(path); if (!items || items.length === 0) return;
        this._insertBuffer.delete(path);
        try {
            const index = await this.getIndex(path); if (index) await index.insertBatch(items);
        } catch(e) { this.indexes.delete(path); }
    }

    async delete(path, key) {
        if (!this._deleteBuffer.has(path)) {
            this._deleteBuffer.set(path, []);
            this.db._pendingIndexOps.push(() => this._flushDeletes(path));
        }
        this._deleteBuffer.get(path).push(key);
    }
    
    async _flushDeletes(path) {
        const keys = this._deleteBuffer.get(path); if (!keys || keys.length === 0) return;
        this._deleteBuffer.delete(path);
        try {
            const index = await this.getIndex(path); if (index) for(const k of keys) await index.delete(k);
        } catch(e) {}
    }

    async nearest(handle, queryVector, k = 5) {
        await this.db._flushBackgroundTasks();
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        const path = h.getPath ? h.getPath() : handle; 
        const index = await this.getIndex(path); if (!index) return [];
        try {
            await index.flushCache(); await index._validateEntryPoint();
            let vec = Array.isArray(queryVector) ? new Float32Array(queryVector) : queryVector;
            if (index.registryPtrs.length === 0 || index.entryNodeID === -1) {
                 if (await this.db.size(h) > 0) { await this.reindex(path); await index._validateEntryPoint(); }
            }
            if (index.entryNodeID === -1 || index.entryNodeID === undefined) return [];
            const entryNode = await index._getNode(index.entryNodeID); if (!entryNode) return [];
            const ef = Math.max(k * 2, 100);
            const results = await index._searchLayer(entryNode, vec, ef, 0); 
            const topK = results.slice(0, k); const hydrated = [];
            for(const res of topK) {
                const item = await require('../liveHandle/index.js').resolvePointer(res.node.payloadPtr, this.db); 
                hydrated.push({ item, score: res.dist });
            }
            return hydrated;
        } catch(e) { return []; }
    }

    async reindex(path) {
        try {
            const index = await this.getIndex(path); if (!index) return;
            const parts = path.split('.').filter(p => p !== 'root');
            let curr = this.db.root[constants.SYMBOLS.INTERNALS] || this.db.root;
            for (let i = 0; i < parts.length; i++) {
                const next = curr.nav.navigate(parts[i]); 
                const nextInt = next[constants.SYMBOLS.INTERNALS] || next;
                await nextInt.ensureResolved(); if (!nextInt.ptr) return; curr = nextInt;
            }
            const ptr = curr.ptr; if (!ptr) return;
            const res = await SmartPointer.resolve(ptr, this.db.allocator);
            let iterator;
            if (curr.type === constants.TYPE_MAP) iterator = (new MapEngine(this.db.allocator, res)).iterateRaw();
            else if (curr.type === constants.TYPE_SEQUENCE) iterator = (new Sequence(this.db.allocator, res)).iterateRaw();
            else return;
            let batch = [];
            for await (const item of iterator) {
                const ptr = item.ptr;
                let val = item.value === undefined ? await SmartPointer.resolve(ptr, this.db.allocator) : item.value;
                let key = item.key !== undefined ? (Buffer.isBuffer(item.key) ? item.key.toString('utf8') : String(item.key)) : batch.length;
                const hydrated = await this.db.search._hydrateStructure(val);
                const vec = this._extractVector(hydrated);
                if (vec) {
                    const stablePtr = Buffer.alloc(16); ptr.copy(stablePtr);
                    batch.push({ key, vector: Array.isArray(vec) ? new Float32Array(vec) : vec, payload: stablePtr });
                    if (batch.length >= 100) { await index.insertBatch(batch); batch = []; }
                }
            }
            if (batch.length > 0) await index.insertBatch(batch);
            await index.flushCache();
        } catch(e) {}
    }

    _extractVector(value) {
        if (!value || typeof value !== 'object') return null;
        for(const c of ['vector', 'embedding', 'vec']) {
            if (value[c] && (Array.isArray(value[c]) || value[c] instanceof Float32Array)) return value[c];
        }
        return null;
    }
}
module.exports = VectorManager;