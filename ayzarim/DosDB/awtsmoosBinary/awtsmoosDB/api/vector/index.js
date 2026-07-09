// B"H
/**
 * @file api/vector/index.js
 * @chapter The Read-Only Road Of Returning Sparks
 * @description nearest() must never create system metadata during a search.
 * It uses an existing HNSW graph if one already exists; otherwise it scans the
 * actual AwtsmoosDB list. Array-like DB vectors are accepted as real vectors.
 */
const HNSW = require('./hnsw.js');
const constants = require('../../constants.js');
const VectorReindexer = require('./reindexer.js');
class VectorManager {
  constructor(db) { this.db = db; this.indexes = new Map(); this.reindexer = new VectorReindexer(db); }
  _hasSysVector() { return !!(this.db.root.__sys_vector__ || this.db.has(this.db.root, '__sys_vector__')); }
  _ensureSysVector() { if (!this._hasSysVector()) this.db.root.__sys_vector__ = new this.db.Map(); }
  _soul(h) { return h && (h[constants.SYMBOLS.INTERNALS] || h); }
  _path(h) { const s = this._soul(h); if (typeof h === 'string') return h; if (s?.ensureResolved) s.ensureResolved(true); return s?.getPath ? s.getPath() : h; }
  _safe(path) { return String(path || '').replace(/\./g, '_'); }
  _plain(v) { if (v?.__resolve__) { try { return v.__resolve__(); } catch (_) {} } return v; }
  _meta(sys, path) { const m = this._plain(sys && sys[path]); if (m?.regPath && m?.mapPath) return m; const safe = this._safe(path), regPath = `__reg_${safe}`, mapPath = `__map_${safe}`; return sys?.[regPath] && sys?.[mapPath] ? { dim: 384, metric: 'cosine', regPath, mapPath, entryNodeID: 0, synthesized: true } : null; }
  enable(handle, options = {}) { this._ensureSysVector(); const sys = this.db.root.__sys_vector__, path = this._path(handle), safe = this._safe(path); if (!this._meta(sys, path)) { const regPath = `__reg_${safe}`, mapPath = `__map_${safe}`; sys[regPath] = new this.db.List(); sys[mapPath] = new this.db.Map(); sys.set(path, { dim: options.dimensions || 1536, metric: options.metric || 'cosine', regPath, mapPath, entryNodeID: 0 }); this.db.waitForIdle(); } if (this.db.sysCache) this.db.sysCache.vector.add(path); this.reindex(path); }
  getIndex(path) { path = this._path(path); if (this.indexes.has(path)) return this.indexes.get(path); if (!this._hasSysVector()) return null; const sys = this.db.root.__sys_vector__, meta = this._meta(sys, path); if (!meta) return null; const reg = sys[meta.regPath], map = sys[meta.mapPath]; if (!reg || !map) return null; const hnsw = new HNSW(this.db, reg, map, meta); hnsw.onEntryPointChanged = id => { meta.entryNodeID = id; try { sys.set(path, meta); } catch (_) {} }; this.indexes.set(path, hnsw); return hnsw; }
  insert(path, key, vector, payload) { const i = this.getIndex(path); if (i) i.insert(key, this._vector(vector), payload); }
  delete(path, key) { const i = this.getIndex(path); if (i) i.delete(key); }
  nearest(handle, queryVector, k = 5) { const q = this._vector(queryVector); const i = this.getIndex(handle); const graph = i ? i.search(q, k) : []; return graph.length ? graph : this._scanNearest(handle, q, k); }
  _scanNearest(handle, q, k) { const out = []; for (const item of this._rows(handle)) { const v = this._vector(item?.vec || item?.embedding); if (!v) continue; out.push({ score: this._cosine(q, v), item }); } return out.sort((a, b) => b.score - a.score).slice(0, k); }
  _rows(handle) { const resolved = this._resolvedArray(handle); if (resolved) return resolved; const len = Number(handle?.length || 0); if (len >= 0 && Number.isFinite(len)) { const out = []; for (let i = 0; i < len; i++) out.push(handle[i]); return out; } const out = []; try { for (const x of handle) out.push(x); } catch (_) {} return out; }
  _resolvedArray(v) { try { const r = v?.__resolve__?.(); return Array.isArray(r) ? r : null; } catch (_) { return null; } }
  _vector(v) { if (!v) return null; if (v instanceof Float32Array) return v; if (Array.isArray(v)) return new Float32Array(v); const len = Number(v.length || 0); if (!len || !Number.isFinite(len)) return null; const out = new Float32Array(len); for (let i = 0; i < len; i++) { const n = Number(v[i]); if (!Number.isFinite(n)) return null; out[i] = n; } return out; }
  _cosine(a, b) { let d = 0, aa = 0, bb = 0, n = Math.min(a.length || 0, b.length || 0); for (let j = 0; j < n; j++) { d += a[j] * b[j]; aa += a[j] * a[j]; bb += b[j] * b[j]; } return d / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1)); }
  reindex(path) { const i = this.getIndex(path); if (!i) return; let cur = this.db.root; for (const p of String(path).split('.').filter(x => x !== 'root')) { cur = cur[p]; if (!cur) return; } this.reindexer.run(path, i, cur); }
}
module.exports = VectorManager;
