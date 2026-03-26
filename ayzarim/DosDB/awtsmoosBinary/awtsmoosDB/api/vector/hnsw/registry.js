
// B"H
module.exports = class HNSWRegistry {
    constructor(hnsw, listH) { this.hnsw = hnsw; this.handle = listH; this.cache = new Map(); this._ptrs = []; }
    init() { if (this._ptrs.length > 0) return; try { for (const p of this.handle) this._ptrs.push(p); } catch(e) {} }
    count() { return this._ptrs.length; }
    getNode(id) {
        if (id < 0 || id >= this._ptrs.length) return null;
        if (this.cache.has(id)) return this.cache.get(id);
        const n = this.hnsw.storage.loadNode(this._ptrs[id]);
        if (n) { if (this.cache.size >= 500) this.cache.delete(this.cache.keys().next().value); this.cache.set(id, n); }
        return n;
    }
    saveNode(n) { const p = this.hnsw.storage.saveNode(n); n.ptr = p; this.cache.set(n.id, n); return p; }
    addPtr(id, p) { this._ptrs[id] = p; if (id >= this.handle.length) this.handle.push(p); else this.handle[id] = p; }
};
