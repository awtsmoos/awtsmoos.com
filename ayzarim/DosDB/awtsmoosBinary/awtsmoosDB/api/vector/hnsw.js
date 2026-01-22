// B"H
/**
 * @file hnsw.js
 * @description Synchronous HNSW Implementation.
 */
const HNSWRegistry = require('./hnsw_registry.js');
const HNSWOps = require('./hnsw_ops.js');
const Storage = require('./storage.js');
const { getMetric } = require('./math.js');

const M = 12;
const M_MAX0 = 24;
const EF_CONSTRUCTION = 100;
const ML = 1 / Math.log(M);

class HNSW {
    constructor(db, registryHandle, keyMapHandle, meta) {
        this.db = db;
        this.registry = new HNSWRegistry(this, registryHandle);
        this.keyMap = keyMapHandle;
        this.meta = meta;
        this.storage = new Storage(db.allocator);
        this.metric = getMetric(meta.metric || 'cosine');
        this.ops = new HNSWOps(this);
        
        this.entryNodeID = meta.entryNodeID !== undefined ? meta.entryNodeID : -1;
    }

    insert(key, vector, payloadPtr) {
        this.registry.init();
        
        const existingId = this.keyMap[String(key)];
        if (existingId !== undefined) {
            const oldNode = this.registry.getNode(existingId);
            if (oldNode) {
                oldNode.deleted = true;
                this.registry.saveNode(oldNode);
            }
        }

        const level = Math.floor(-Math.log(Math.random()) * ML);
        const nodeId = this.registry.count();
        
        const newNode = {
            id: nodeId,
            level,
            vector,
            neighbors: [],
            payloadPtr: payloadPtr || Buffer.alloc(16),
            deleted: false
        };
        
        // Save initially
        this.registry.saveNode(newNode);
        this.registry.addPtr(nodeId, newNode.ptr); // Should update list handle
        this.keyMap.set(String(key), nodeId);

        let currObj = this.registry.getNode(this.entryNodeID);
        
        if (!currObj) {
            this.entryNodeID = nodeId;
            if (this.onEntryPointChanged) this.onEntryPointChanged(nodeId);
            return;
        }

        let currDist = this.metric(vector, currObj.vector);
        let currLevel = currObj.level;

        for (let l = currLevel; l > level; l--) {
            let changed = true;
            while(changed) {
                changed = false;
                const neighbors = currObj.neighbors[l] || [];
                for(const nId of neighbors) {
                    const nNode = this.registry.getNode(nId);
                    if(!nNode) continue;
                    const dist = this.metric(vector, nNode.vector);
                    if(dist < currDist) {
                        currDist = dist;
                        currObj = nNode;
                        changed = true;
                    }
                }
            }
        }

        for (let l = Math.min(level, currLevel); l >= 0; l--) {
            const candidates = this.ops.searchLayer(currObj, vector, EF_CONSTRUCTION, l);
            const selected = this.ops.selectNeighbors(candidates, l === 0 ? M_MAX0 : M);
            
            newNode.neighbors[l] = [];
            for (const c of selected) {
                const neighbor = c.node;
                newNode.neighbors[l].push(neighbor.id);
                this.ops.connectNeighbor(neighbor, newNode.id, l);
            }
            if (candidates.length > 0) currObj = candidates[0].node;
        }
        
        this.registry.saveNode(newNode);

        if (currObj && level > currObj.level) {
            this.entryNodeID = nodeId;
            if (this.onEntryPointChanged) this.onEntryPointChanged(nodeId);
        }
    }

    delete(key) {
        const nodeId = this.keyMap[String(key)];
        if (nodeId === undefined) return;
        
        const node = this.registry.getNode(nodeId);
        if (node) {
            node.deleted = true;
            this.registry.saveNode(node);
        }
        this.keyMap.delete(String(key));
    }

    search(queryVec, k) {
        this.registry.init();
        if (this.entryNodeID === -1) return [];
        
        const entry = this.registry.getNode(this.entryNodeID);
        if (!entry) return [];

        const ef = Math.max(k * 2, 100);
        // Descent
        let currObj = entry;
        let currDist = this.metric(queryVec, entry.vector);
        
        for (let l = entry.level; l > 0; l--) {
            let changed = true;
            while (changed) {
                changed = false;
                const neighbors = currObj.neighbors[l] || [];
                for (const nId of neighbors) {
                    const n = this.registry.getNode(nId);
                    if (!n) continue;
                    const d = this.metric(queryVec, n.vector);
                    if (d < currDist) {
                        currDist = d;
                        currObj = n;
                        changed = true;
                    }
                }
            }
        }

        const candidates = this.ops.searchLayer(currObj, queryVec, ef, 0);
        
        // Hydrate Results
        const results = [];
        let count = 0;
        const LiveHandle = require('../liveHandle/index.js'); // Lazy load avoids cycle

        for (const c of candidates) {
            if (!c.node.deleted && count < k) {
                const item = LiveHandle.resolvePointer(c.node.payloadPtr, this.db);
                results.push({ item, score: c.dist });
                count++;
            }
        }
        return results;
    }
}

module.exports = HNSW;