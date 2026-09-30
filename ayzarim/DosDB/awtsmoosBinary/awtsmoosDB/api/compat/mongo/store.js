// B"H — Storage layout for the AwtsmoosDB MongoDB compat layer.
//
// Key layout (all under db.root):
//   __mongo:<db>:<coll>:meta          -> { idChunks, seq, indexes: [] }
//   __mongo:<db>:<coll>:ids:<i>       -> array of storage keys (<=1000 per chunk)
//   __mongo:<db>:<coll>:doc:<skey>    -> normalized document (holds the real _id)
//   __mongo:<db>:colls                -> [collection names]
// Only the public engine API is used: db.root reads/writes/deletes, db.batch().
'use strict';
const { ObjectId } = require('./objectid');

const PREFIX = '__mongo:';
const CHUNK = 1000;
const HEX24 = /^[0-9a-fA-F]{24}$/;

function esc(s) { return String(s).replace(/%/g, '%25').replace(/:/g, '%3A'); }
function base(dbName, collName) { return PREFIX + esc(dbName) + ':' + esc(collName) + ':'; }
function metaKey(b) { return b + 'meta'; }
function idsKey(b, i) { return b + 'ids:' + i; }
function docKey(b, skey) { return b + 'doc:' + skey; }
function collsKey(dbName) { return PREFIX + esc(dbName) + ':colls'; }

// Deep-resolve liveHandle lazy values (handles expose __resolve__()).
// NOTE: object reads come back as FUNCTION-handles (typeof 'function') with
// __resolve__ attached — not plain objects. Both shapes are resolved here.
function resolveValue(v, depth) {
  if (depth === undefined) depth = 0;
  if (depth > 60) return v;
  if (v !== null && (typeof v === 'object' || typeof v === 'function')) {
    if (typeof v.__resolve__ === 'function') {
      let r;
      try { r = v.__resolve__(); } catch (e) { return undefined; }
      return resolveValue(r, depth + 1);
    }
    if (typeof v === 'function') {
      // Handle-function without __resolve__: copy own enumerable props defensively.
      const out = {};
      const ks = Object.keys(v);
      for (let i = 0; i < ks.length; i++) {
        if (ks[i] === '__resolve__') continue;
        out[ks[i]] = resolveValue(v[ks[i]], depth + 1);
      }
      return out;
    }
    if (Array.isArray(v)) {
      const out = new Array(v.length);
      for (let i = 0; i < v.length; i++) out[i] = resolveValue(v[i], depth + 1);
      return out;
    }
    let out;
    try {
      const ks = Object.keys(v);
      out = {};
      for (let i = 0; i < ks.length; i++) {
        if (ks[i] === '__resolve__') continue;
        out[ks[i]] = resolveValue(v[ks[i]], depth + 1);
      }
    } catch (e) { return v; }
    return out;
  }
  return v;
}

// Write-through cache: the engine buffers db.batch() writes until flush(),
// so immediate read-your-writes MUST be served from this cache. Keyed per
// AwtsmoosDB instance (WeakMap) so two clients on one file don't share state.
// Values cached are the RESOLVED/NORMALIZED forms; readDoc's reviveVal clones
// on every read, so callers can never mutate cached entries.
const _caches = new WeakMap();
const CACHE_MAX = 100000;
function _cache(awtDb) {
  let m = _caches.get(awtDb);
  if (!m) { m = new Map(); _caches.set(awtDb, m); }
  return m;
}
function _cacheSet(awtDb, key, val) {
  const m = _cache(awtDb);
  if (m.size >= CACHE_MAX) {
    // Evict oldest half (Map preserves insertion order). Eviction is safe:
    // the engine still has the data; next read just re-resolves.
    let n = 0;
    const drop = Math.floor(CACHE_MAX / 2);
    for (const k of m.keys()) { m.delete(k); if (++n >= drop) break; }
  }
  // Refresh recency.
  if (m.has(key)) m.delete(key);
  m.set(key, val);
}

function readKey(awtDb, key) {
  const m = _caches.get(awtDb);
  if (m && m.has(key)) return m.get(key);
  const v = resolveValue(awtDb.root[key]);
  _cacheSet(awtDb, key, v);
  return v;
}
function writeKey(awtDb, key, val) {
  awtDb.root[key] = val;
  _cacheSet(awtDb, key, val);
}
function deleteKey(awtDb, key) {
  delete awtDb.root[key];
  const m = _caches.get(awtDb);
  if (m) m.delete(key);
}

// Run fn inside db.batch() when available; tolerate any batch signature.
function withBatch(awtDb, fn) {
  let ran = false;
  const wrapped = () => { ran = true; return fn(); };
  if (awtDb && typeof awtDb.batch === 'function') {
    try {
      const r = awtDb.batch(wrapped);
      if (!ran) return fn();
      return r;
    } catch (e) {
      if (!ran) return fn();
      throw e;
    }
  }
  return fn();
}

// --- value normalization: ObjectId/Date <-> tagged plain objects (engine-safe) ---
function normalizeVal(v) {
  if (v === null || v === undefined) return v;
  const t = typeof v;
  if (t !== 'object') return v;
  if (v instanceof ObjectId) return { $oid: v.toHexString() };
  if (v instanceof Date) return { $date: v.getTime() };
  if (Array.isArray(v)) {
    const out = new Array(v.length);
    for (let i = 0; i < v.length; i++) out[i] = normalizeVal(v[i]);
    return out;
  }
  const out = {};
  const ks = Object.keys(v);
  for (let i = 0; i < ks.length; i++) out[ks[i]] = normalizeVal(v[ks[i]]);
  return out;
}

function reviveVal(v) {
  if (v === null || v === undefined) return v;
  const t = typeof v;
  if (t !== 'object') return v;
  if (Array.isArray(v)) {
    const out = new Array(v.length);
    for (let i = 0; i < v.length; i++) out[i] = reviveVal(v[i]);
    return out;
  }
  const ks = Object.keys(v);
  if (ks.length === 1 && ks[0] === '$oid' && typeof v.$oid === 'string' && HEX24.test(v.$oid)) {
    try { return new ObjectId(v.$oid); } catch (e) { /* fall through */ }
  }
  if (ks.length === 1 && ks[0] === '$date' && typeof v.$date === 'number') {
    return new Date(v.$date);
  }
  const out = {};
  for (let i = 0; i < ks.length; i++) out[ks[i]] = reviveVal(v[ks[i]]);
  return out;
}

// Storage key derivation from a NORMALIZED _id. Returns null for exotic _ids
// (object/array), in which case the caller uses the seq counter.
function skeyForId(nid) {
  if (nid !== null && typeof nid === 'object') {
    if (!Array.isArray(nid)) {
      const ks = Object.keys(nid);
      if (ks.length === 1 && ks[0] === '$oid' && typeof nid.$oid === 'string') {
        return 'oid:' + nid.$oid.toLowerCase();
      }
    }
    return null;
  }
  const t = typeof nid;
  if (t === 'string') return 'str:' + nid;
  if (t === 'number') return 'num:' + String(nid);
  if (t === 'boolean') return 'bool:' + String(nid);
  if (nid === null) return 'null:';
  return null;
}

function getMeta(awtDb, b) {
  const m = readKey(awtDb, metaKey(b));
  if (m && typeof m === 'object') return m;
  return { idChunks: 0, seq: 0, indexes: [] };
}
function setMeta(awtDb, b, meta) {
  writeKey(awtDb, metaKey(b), meta);
}

function listStorageKeys(awtDb, b) {
  const meta = getMeta(awtDb, b);
  const out = [];
  for (let i = 0; i < meta.idChunks; i++) {
    const chunk = readKey(awtDb, idsKey(b, i));
    if (Array.isArray(chunk)) {
      for (let j = 0; j < chunk.length; j++) out.push(chunk[j]);
    }
  }
  return out;
}

function appendStorageKey(awtDb, b, meta, skey) {
  let idx = meta.idChunks - 1;
  let chunk = idx >= 0 ? readKey(awtDb, idsKey(b, idx)) : null;
  if (!Array.isArray(chunk) || chunk.length >= CHUNK) {
    chunk = [];
    idx = meta.idChunks;
    meta.idChunks = idx + 1;
  }
  chunk.push(skey);
  writeKey(awtDb, idsKey(b, idx), chunk);
  setMeta(awtDb, b, meta);
}

function removeStorageKey(awtDb, b, meta, skey) {
  for (let i = 0; i < meta.idChunks; i++) {
    const k = idsKey(b, i);
    const chunk = readKey(awtDb, k);
    if (Array.isArray(chunk)) {
      const at = chunk.indexOf(skey);
      if (at !== -1) {
        chunk.splice(at, 1);
        if (chunk.length === 0) {
          // Drop empty trailing chunks to keep the list compact.
          let last = meta.idChunks - 1;
          while (last > i) {
            const c = readKey(awtDb, idsKey(b, last));
            if (Array.isArray(c) && c.length > 0) break;
            deleteKey(awtDb, idsKey(b, last));
            last--;
          }
          if (last === i) { deleteKey(awtDb, k); meta.idChunks = i; }
          else { deleteKey(awtDb, k); meta.idChunks = last + 1; }
          setMeta(awtDb, b, meta);
        } else {
          writeKey(awtDb, k, chunk);
        }
        return true;
      }
    }
  }
  return false;
}

function readDoc(awtDb, b, skey) {
  const raw = readKey(awtDb, docKey(b, skey));
  if (raw === undefined) return undefined;
  return reviveVal(raw);
}

function writeDoc(awtDb, b, skey, doc) {
  writeKey(awtDb, docKey(b, skey), normalizeVal(doc));
}

function deleteDoc(awtDb, b, skey) {
  deleteKey(awtDb, docKey(b, skey));
}

function ensureCollectionListed(awtDb, dbName, collName) {
  const k = collsKey(dbName);
  let list = readKey(awtDb, k);
  if (!Array.isArray(list)) list = [];
  if (list.indexOf(collName) === -1) {
    list.push(collName);
    writeKey(awtDb, k, list);
  }
}

function listCollections(awtDb, dbName) {
  const list = readKey(awtDb, collsKey(dbName));
  return Array.isArray(list) ? list.slice() : [];
}

module.exports = {
  PREFIX, CHUNK,
  base, metaKey, idsKey, docKey, collsKey,
  readKey, writeKey, deleteKey, withBatch,
  resolveValue, normalizeVal, reviveVal,
  skeyForId, getMeta, setMeta,
  listStorageKeys, appendStorageKey, removeStorageKey,
  readDoc, writeDoc, deleteDoc,
  ensureCollectionListed, listCollections,
};
