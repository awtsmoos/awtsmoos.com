// B"H
/**
 * @file api/vector/hnsw/registry.js
 * @chapter The Pointers Must Follow The Soul
 * @description HNSW nodes are immutable disk writes. Whenever a node is saved,
 * even an old neighbor updated by connection repair, its registry pointer must
 * be replaced. Otherwise the reopened world sees stale, disconnected nodes.
 */
module.exports = class HNSWRegistry {
  constructor(hnsw, listH) { this.hnsw = hnsw; this.handle = listH; this.cache = new Map(); this._ptrs = []; }
  init() { if (this._ptrs.length) return; try { for (const p of this.handle) this._ptrs.push(p); } catch (_) {} }
  count() { this.init(); return this._ptrs.length; }
  getNode(id) {
    this.init();
    if (id < 0 || id >= this._ptrs.length) return null;
    if (this.cache.has(id)) return this.cache.get(id);
    const node = this.hnsw.storage.loadNode(this._ptrs[id]);
    if (node) { if (this.cache.size >= 500) this.cache.delete(this.cache.keys().next().value); this.cache.set(id, node); }
    return node;
  }
  saveNode(node) {
    const ptr = this.hnsw.storage.saveNode(node);
    node.ptr = ptr; this.cache.set(node.id, node); this._ptrs[node.id] = ptr;
    if (node.id >= this.handle.length) this.handle.push(ptr); else this.handle[node.id] = ptr;
    return ptr;
  }
  addPtr(id, ptr) { this._ptrs[id] = ptr; if (id >= this.handle.length) this.handle.push(ptr); else this.handle[id] = ptr; }
};
