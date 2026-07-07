// B"H
/**
 * @file api/vector/index.js
 * @chapter The Reopened Lattice Remembers Its Gate
 * @description The VectorManager governs HNSW search. It now survives reopened
 * shards whose vector metadata revives through live-handle function vessels by
 * unwrapping metadata when possible and synthesizing it from persisted registry
 * buckets when necessary. The Awtsmoos hides the map, then reveals the road.
 */
const HNSW = require('./hnsw.js');
const constants = require('../../constants.js');
const VectorReindexer = require('./reindexer.js');

class VectorManager {
  constructor(db) { this.db = db; this.indexes = new Map(); this.reindexer = new VectorReindexer(db); }
  _ensureSysVector() {
    if (!this.db.root.__sys_vector__) {
      if (!this.db.has(this.db.root, '__sys_vector__')) this.db.root.__sys_vector__ = new this.db.Map();
    }
  }
  _soul(handle) { return handle && (handle[constants.SYMBOLS.INTERNALS] || handle); }
  _path(handle) {
    const soul = this._soul(handle);
    if (typeof handle === 'string') return handle;
    if (soul && soul.ensureResolved) soul.ensureResolved(true);
    return soul && soul.getPath ? soul.getPath() : handle;
  }
  _safe(path) { return String(path || '').replace(/\./g, '_'); }
  _plain(value) {
    if (value && typeof value.__resolve__ === 'function') {
      try { return value.__resolve__(); } catch (_) { return value; }
    }
    return value;
  }
  _meta(sysVector, path) {
    let meta = this._plain(sysVector[path]);
    if (meta && typeof meta === 'object' && meta.regPath && meta.mapPath) return meta;
    const safe = this._safe(path), regPath = `__reg_${safe}`, mapPath = `__map_${safe}`;
    if (sysVector[regPath] && sysVector[mapPath]) return { dim: 384, metric: 'cosine', regPath, mapPath, entryNodeID: 0, synthesized: true };
    return null;
  }
  _handle(sysVector, key) { return sysVector[key] || null; }
  enable(handle, options = {}) {
    this._ensureSysVector();
    const sysVector = this.db.root.__sys_vector__, path = this._path(handle), safe = this._safe(path);
    if (!path) throw new Error('B"H vector enable requires a resolvable handle path');
    if (!this._meta(sysVector, path)) {
      const regPath = `__reg_${safe}`, mapPath = `__map_${safe}`;
      sysVector[regPath] = new this.db.List(); sysVector[mapPath] = new this.db.Map();
      sysVector.set(path, { dim: options.dimensions || 1536, metric: options.metric || 'cosine', regPath, mapPath, entryNodeID: 0 });
      this.db.waitForIdle();
    }
    if (this.db.sysCache) this.db.sysCache.vector.add(path);
    this.reindex(path);
  }
  getIndex(path) {
    path = this._path(path);
    if (this.indexes.has(path)) return this.indexes.get(path);
    this._ensureSysVector();
    const sysVector = this.db.root.__sys_vector__, meta = this._meta(sysVector, path);
    if (!meta) return null;
    const registryHandle = this._handle(sysVector, meta.regPath), mapHandle = this._handle(sysVector, meta.mapPath);
    if (!registryHandle || !mapHandle) return null;
    const rH = this._soul(registryHandle), mH = this._soul(mapHandle);
    if (rH && rH.ensureResolved) rH.ensureResolved();
    if (mH && mH.ensureResolved) mH.ensureResolved();
    const hnsw = new HNSW(this.db, registryHandle, mapHandle, meta);
    hnsw.onEntryPointChanged = newID => { meta.entryNodeID = newID; try { sysVector.set(path, meta); } catch (_) {} };
    this.indexes.set(path, hnsw); return hnsw;
  }
  insert(path, key, vector, payload) { const index = this.getIndex(path); if (index) index.insert(key, Array.isArray(vector) ? new Float32Array(vector) : vector, payload); }
  delete(path, key) { const index = this.getIndex(path); if (index) index.delete(key); }
  nearest(handle, queryVector, k = 5) { const index = this.getIndex(handle); if (!index) return []; return index.search(Array.isArray(queryVector) ? new Float32Array(queryVector) : queryVector, k); }
  reindex(path) {
    const index = this.getIndex(path); if (!index) return;
    let current = this.db.root;
    for (const part of String(path).split('.').filter(p => p !== 'root')) { current = current[part]; if (!current) return; }
    this.reindexer.run(path, index, current);
  }
}
module.exports = VectorManager;
