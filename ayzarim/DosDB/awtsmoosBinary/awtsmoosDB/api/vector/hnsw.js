
// B"H
const HNSWRegistry = require('./hnsw/registry.js');
const HNSWOps = require('./hnsw/ops.js');
const Storage = require('./storage.js');
const { getMetric } = require('./math.js');

const M = 12, EF_CONSTRUCTION = 100, ML = 1 / Math.log(M);

class HNSW {
    constructor(db, regH, keyMapH, meta) {
        this.db = db; this.registry = new HNSWRegistry(this, regH); this.keyMap = keyMapH; this.meta = meta;
        this.storage = new Storage(db.allocator); this.metric = getMetric(meta.metric || 'cosine'); this.ops = new HNSWOps(this);
        this.entryNodeID = meta.entryNodeID !== undefined ? meta.entryNodeID : -1;
    }
    insert(key, vector, payloadPtr) {
        this.registry.init();
        const existing = this.keyMap[String(key)];
        if (existing !== undefined) { const old = this.registry.getNode(existing); if (old) { old.deleted = true; this.registry.saveNode(old); } }
        const level = Math.floor(-Math.log(Math.random()) * ML), id = this.registry.count();
        const node = { id, level, vector, neighbors: [], payloadPtr: payloadPtr || Buffer.alloc(16), deleted: false };
        this.registry.saveNode(node); this.registry.addPtr(id, node.ptr); this.keyMap.set(String(key), id);
        let curr = this.registry.getNode(this.entryNodeID);
        if (!curr) { this.entryNodeID = id; if (this.onEntryPointChanged) this.onEntryPointChanged(id); return; }
        let d = this.metric(vector, curr.vector), curL = curr.level;
        for (let l = curL; l > level; l--) {
            let changed = true;
            while(changed) {
                changed = false;
                for(const nId of (curr.neighbors[l] || [])) {
                    const n = this.registry.getNode(nId); if(!n) continue;
                    const dist = this.metric(vector, n.vector); if(dist < d) { d = dist; curr = n; changed = true; }
                }
            }
        }
        for (let l = Math.min(level, curL); l >= 0; l--) {
            const cand = this.ops.searchLayer(curr, vector, EF_CONSTRUCTION, l);
            const sel = cand.slice(0, l === 0 ? 24 : 12);
            node.neighbors[l] = [];
            for (const c of sel) { node.neighbors[l].push(c.node.id); this.ops.connectNeighbor(c.node, id, l); }
            if (cand.length > 0) curr = cand[0].node;
        }
        this.registry.saveNode(node);
        if (curr && level > curr.level) { this.entryNodeID = id; if (this.onEntryPointChanged) this.onEntryPointChanged(id); }
    }
    delete(key) {
        const id = this.keyMap[String(key)]; if (id === undefined) return;
        const node = this.registry.getNode(id); if (node) { node.deleted = true; this.registry.saveNode(node); }
        this.keyMap.delete(String(key));
    }
    search(queryVec, k) {
        this.registry.init(); if (this.entryNodeID === -1) return [];
        const entry = this.registry.getNode(this.entryNodeID); if (!entry) return [];
        let curr = entry, d = this.metric(queryVec, entry.vector);
        for (let l = entry.level; l > 0; l--) {
            let changed = true;
            while (changed) {
                changed = false;
                for (const nId of (curr.neighbors[l] || [])) {
                    const n = this.registry.getNode(nId); if (!n) continue;
                    const dist = this.metric(queryVec, n.vector); if (dist < d) { d = dist; curr = n; changed = true; }
                }
            }
        }
        const cand = this.ops.searchLayer(curr, queryVec, Math.max(k * 2, 100), 0);
        const results = []; let count = 0; const LiveHandle = require('../liveHandle/index.js');
        for (const c of cand) { if (!c.node.deleted && count < k) { results.push({ item: LiveHandle.resolvePointer(c.node.payloadPtr, this.db), score: c.dist }); count++; } }
        return results;
    }
}
module.exports = HNSW;
