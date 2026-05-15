// B"H

/**
 * @file api/indexes/index.js
 * @chapter The Secondary Lamp Beside The Main Road
 * @description Small exact-match secondary indexes for table-like collections.
 */

class IndexManager {
  constructor(db) { this.db = db; this.rebuilding = false; this.active = false; }

  create(collectionPath, field, options = {}) {
    const name = options.name || `${collectionPath}:${field}`;
    this.active = true;
    this.meta()[name] = { collectionPath, field, name };
    return this.rebuild(name);
  }

  rebuild(name) {
    if (this.rebuilding) return { ok: true, name, skipped: true };
    const spec = this.meta()[name];
    if (!spec) throw new Error(`B"H: missing index ${name}`);
    this.rebuilding = true;
    try {
      const out = {};
      const collection = this.read(spec.collectionPath);
      const keys = collection ? this.db.keys(collection, { limit: Infinity }) : [];
      for (const key of keys) {
        const row = this.db._plain(collection[key]);
        const val = row && row[spec.field];
        const bucket = keyOf(val);
        if (!out[bucket]) out[bucket] = [];
        out[bucket].push(String(key));
      }
      this.data()[name] = out;
      return { ok: true, name, keys: keys.length };
    } finally {
      this.rebuilding = false;
    }
  }

  find(name, value) {
    if (!this.rebuilding && this.meta()[name]) this.rebuild(name);
    const table = this.db._plain(this.data()[name]) || {};
    const ids = this.db._plain(table[keyOf(value)]) || [];
    return Array.isArray(ids) ? ids.slice() : [];
  }

  list() {
    return Object.keys(this.meta());
  }

  afterWrite(path) {
    if (!this.active) return;
    if (this.rebuilding || String(path).startsWith('root.__indexes__')) return;
    const rowPath = parentPath(path);
    for (const [name, spec] of Object.entries(this.db._plain(this.meta()) || {})) {
      if (rowPath === spec.collectionPath || String(path).startsWith(`${spec.collectionPath}.`)) this.rebuild(name);
    }
  }

  meta() {
    if (!this.db.root.__indexes__) this.db.root.__indexes__ = {};
    if (!this.db.root.__indexes__.meta) this.db.root.__indexes__.meta = {};
    return this.db.root.__indexes__.meta;
  }

  data() {
    if (!this.db.root.__indexes__) this.db.root.__indexes__ = {};
    if (!this.db.root.__indexes__.data) this.db.root.__indexes__.data = {};
    return this.db.root.__indexes__.data;
  }

  read(p) {
    let cur = this.db.root;
    for (const part of String(p).replace(/^root\.?/, '').split('.').filter(Boolean)) cur = cur == null ? undefined : cur[part];
    return cur;
  }

  hasStoredIndexes() {
    const root = this.db.root && this.db.root.__indexes__;
    const plain = root && this.db._plain(root.meta);
    this.active = !!(plain && Object.keys(plain).length);
    return this.active;
  }
}

module.exports = IndexManager;

function keyOf(value) {
  return `$${Buffer.from(JSON.stringify(value)).toString('base64')}`;
}

function parentPath(path) {
  const parts = String(path).split('.').filter(Boolean);
  parts.pop();
  return parts.join('.');
}
