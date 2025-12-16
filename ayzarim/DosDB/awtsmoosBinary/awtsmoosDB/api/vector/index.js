
// B"H
const HNSW = require('./hnsw.js');
const VectorStorage = require('./storage.js');
const constants = require('../../constants.js');

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
        if (existing) return;

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

    async getIndex(path) {
        await this._init();
        if (this.indexes.has(path)) return this.indexes.get(path);

        const meta = await this.sysVector.get(path);
        if (!meta) return null;

        const registryHandle = this.sysVector[meta.regPath];
        const mapHandle = this.sysVector[meta.mapPath];
        
        if (!registryHandle || !mapHandle) return null;

        const hnsw = new HNSW(this.db, registryHandle, mapHandle, meta);
        
        const originalInsert = hnsw.insert.bind(hnsw);
        
        hnsw.insert = async (key, vec, payload) => {
            // B"H: Capture OLD ID by value to detect change
            const oldEntryID = hnsw.meta.entryNodeID;
            
            const res = await originalInsert(key, vec, payload);
            
            // B"H: Sync if Entry Node ID changed
            if (oldEntryID !== hnsw.meta.entryNodeID) {
                // Update the object in storage
                meta.entryNodeID = hnsw.meta.entryNodeID;
                await this.sysVector.set(path, meta);
            }
            return res;
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
    }

    async delete(path, key) {
        const index = await this.getIndex(path);
        if (!index) return;
        await index.delete(key);
    }

    async nearest(path, queryVector, k = 5) {
        const index = await this.getIndex(path);
        if (!index) throw new Error(`Vector index not found for ${path}`);
        
        // B"H: Important - Flush any pending inserts before searching to ensure consistency
        await index.flushCache();

        let vec = queryVector;
        if (Array.isArray(queryVector)) vec = new Float32Array(queryVector);

        // B"H: Check if entry node is valid
        if (index.entryNodeID === -1 || index.entryNodeID === undefined) {
             return [];
        }

        const entryNode = await index._getNode(index.entryNodeID);
        if (!entryNode) return [];

        const results = await index._searchLayer(entryNode, vec, k, 0); 
        const hydrated = [];
        for(const res of results) {
            const ptr = res.node.payloadPtr;
            const item = await require('../liveHandle/index.js').resolvePointer(ptr, this.db); 
            hydrated.push({ item, score: res.dist });
        }
        return hydrated;
    }
}
module.exports = VectorManager;
