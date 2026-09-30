// B"H — MongoDB-compatible Collection + Cursor for the AwtsmoosDB compat layer.
// Mirrors the mongodb npm driver's API: same class/method names, signatures,
// and result shapes. All methods are async (Promises) like the real driver,
// except find()/aggregate() which return a Cursor synchronously.
'use strict';
const { ObjectId } = require('./objectid');
const store = require('./store');
const { matchesFilter, deepEqual } = require('./filter');
const { applyUpdate, cloneVal } = require('./update');
const { runPipeline, applyProjection, sortDocs } = require('./aggregate');

function dupKeyError(idRepr) {
  const e = new Error('E11000 duplicate key error collection');
  e.code = 11000;
  e.keyValue = { _id: idRepr };
  return e;
}

class Cursor {
  constructor(docs) {
    this._docs = docs || [];
    this._sort = null;
    this._skip = 0;
    this._limit = 0;
    this._project = null;
    this._arr = null;
    this._pos = 0;
  }
  sort(spec) { this._sort = spec; this._arr = null; return this; }
  skip(n) { this._skip = n; this._arr = null; return this; }
  limit(n) { this._limit = n; this._arr = null; return this; }
  project(spec) { this._project = spec; this._arr = null; return this; }
  async toArray() {
    if (!this._arr) {
      let docs = this._docs.slice();
      if (this._sort) docs = sortDocs(docs, this._sort);
      if (this._skip) docs = docs.slice(this._skip);
      if (this._limit) docs = docs.slice(0, this._limit);
      if (this._project) docs = docs.map(d => applyProjection(d, this._project));
      this._arr = docs;
    }
    return this._arr.slice();
  }
  async next() {
    if (!this._arr) { await this.toArray(); this._pos = 0; }
    return this._pos < this._arr.length ? this._arr[this._pos++] : null;
  }
  async hasNext() {
    if (!this._arr) { await this.toArray(); this._pos = 0; }
    return this._pos < this._arr.length;
  }
}

class Collection {
  constructor(db, name) {
    this._db = db;
    this._name = String(name);
    this.collectionName = this._name;
    this.namespace = db.databaseName + '.' + this._name;
  }
  _awt() { return this._db._client._awtDb; }
  _base() { return store.base(this._db.databaseName, this._name); }

  _scanAll() {
    const awt = this._awt(), b = this._base();
    const skeys = store.listStorageKeys(awt, b);
    const out = [];
    for (let i = 0; i < skeys.length; i++) {
      const d = store.readDoc(awt, b, skeys[i]);
      if (d !== undefined) out.push({ _sk: skeys[i], doc: d });
    }
    return out;
  }

  _register() {
    store.ensureCollectionListed(this._awt(), this._db.databaseName, this._name);
  }

  _skeyForNormalizedId(nid, meta) {
    let sk = store.skeyForId(nid);
    if (sk === null) {
      sk = 'seq:' + meta.seq;
      meta.seq++;
    }
    return sk;
  }

  async insertOne(doc) {
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
      throw new Error('document must be a non-array object');
    }
    const awt = this._awt(), b = this._base();
    const nd = store.normalizeVal(cloneVal(doc));
    if (nd._id === undefined) nd._id = { $oid: new ObjectId().toHexString() };
    const self = this;
    return store.withBatch(awt, () => {
      const meta = store.getMeta(awt, b);
      const sk = self._skeyForNormalizedId(nd._id, meta);
      if (store.readDoc(awt, b, sk) !== undefined) throw dupKeyError(nd._id);
      store.writeDoc(awt, b, sk, nd);
      store.appendStorageKey(awt, b, meta, sk);
      self._register();
      return { acknowledged: true, insertedId: store.reviveVal(nd)._id };
    });
  }

  async insertMany(docs, options) {
    if (!Array.isArray(docs)) throw new Error('docs must be an array');
    const ordered = !options || options.ordered !== false;
    const awt = this._awt(), b = this._base();
    const self = this;
    const insertedIds = {};
    const writeErrors = [];
    const result = store.withBatch(awt, () => {
      const meta = store.getMeta(awt, b);
      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        try {
          if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
            throw new Error('document must be a non-array object');
          }
          const nd = store.normalizeVal(cloneVal(doc));
          if (nd._id === undefined) nd._id = { $oid: new ObjectId().toHexString() };
          const sk = self._skeyForNormalizedId(nd._id, meta);
          if (store.readDoc(awt, b, sk) !== undefined) throw dupKeyError(nd._id);
          store.writeDoc(awt, b, sk, nd);
          store.appendStorageKey(awt, b, meta, sk);
          insertedIds[i] = store.reviveVal(nd)._id;
        } catch (e) {
          writeErrors.push({ index: i, code: e.code || 0, errmsg: String(e && e.message || e) });
          if (ordered) break;
        }
      }
      self._register();
      return { acknowledged: true, insertedIds };
    });
    if (writeErrors.length > 0) {
      const e = new Error('bulk write error: ' + writeErrors[0].errmsg);
      e.code = writeErrors[0].code;
      e.writeErrors = writeErrors;
      e.result = result;
      throw e;
    }
    return result;
  }

  _applyFindOptions(cursor, options) {
    if (!options) return cursor;
    if (options.sort) cursor.sort(options.sort);
    if (options.skip) cursor.skip(options.skip);
    if (options.limit) cursor.limit(options.limit);
    if (options.projection) cursor.project(options.projection);
    return cursor;
  }

  find(filter, options) {
    if (filter !== undefined && (filter === null || typeof filter !== 'object' || Array.isArray(filter))) {
      throw new Error('filter must be an object');
    }
    const f = filter || {};
    const docs = this._scanAll()
      .filter(e => matchesFilter(e.doc, f))
      .map(e => e.doc);
    return this._applyFindOptions(new Cursor(docs), options);
  }

  async findOne(filter, options) {
    const cur = this.find(filter || {}, options);
    if (options && options.sort) cur.sort(options.sort);
    const arr = await cur.limit(1).toArray();
    return arr.length ? arr[0] : null;
  }

  async countDocuments(filter) {
    const f = filter || {};
    const all = this._scanAll();
    let n = 0;
    for (let i = 0; i < all.length; i++) if (matchesFilter(all[i].doc, f)) n++;
    return n;
  }

  async estimatedDocumentCount() {
    return this._scanAll().length;
  }

  _updateMatched(filter, update, options, many) {
    const awt = this._awt(), b = this._base();
    const self = this;
    return store.withBatch(awt, () => {
      const all = self._scanAll();
      const matched = all.filter(e => matchesFilter(e.doc, filter));
      const targets = many ? matched : matched.slice(0, 1);
      let modifiedCount = 0;
      for (let i = 0; i < targets.length; i++) {
        const r = applyUpdate(targets[i].doc, update);
        if (r.modified) {
          store.writeDoc(awt, b, targets[i]._sk, store.normalizeVal(r.doc));
          modifiedCount++;
        }
      }
      if (targets.length === 0 && options && options.upsert) {
        // Build the upserted doc from equality fields in the filter + the update.
        const nd = {};
        const fk = Object.keys(filter);
        for (let i = 0; i < fk.length; i++) {
          const k = fk[i], fv = filter[k];
          if (k[0] === '$') continue;
          if (fv !== null && typeof fv === 'object' && !(fv instanceof ObjectId) &&
              !(fv instanceof Date) && !Array.isArray(fv)) {
            const fkeys = Object.keys(fv);
            if (fkeys.length > 0 && fkeys.some(kk => kk[0] === '$')) continue; // operator, not equality
          }
          nd[k] = cloneVal(fv);
        }
        const r = applyUpdate(Object.assign({ _id: new ObjectId() }, nd), update);
        const fin = store.normalizeVal(r.doc);
        const meta = store.getMeta(awt, b);
        const sk = self._skeyForNormalizedId(fin._id, meta);
        store.writeDoc(awt, b, sk, fin);
        store.appendStorageKey(awt, b, meta, sk);
        self._register();
        const rid = store.reviveVal(fin)._id;
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedCount: 1, upsertedId: rid };
      }
      return {
        acknowledged: true,
        matchedCount: matched.length,
        modifiedCount,
        upsertedCount: 0,
        upsertedId: null,
      };
    });
  }

  async updateOne(filter, update, options) {
    return this._updateMatched(filter || {}, update, options || {}, false);
  }

  async updateMany(filter, update, options) {
    return this._updateMatched(filter || {}, update, options || {}, true);
  }

  async replaceOne(filter, replacement, options) {
    if (!replacement || typeof replacement !== 'object' || Array.isArray(replacement)) {
      throw new Error('replacement must be a non-array object');
    }
    const rk = Object.keys(replacement);
    if (rk.some(k => k[0] === '$')) throw new Error('replacement must not contain atomic operators');
    return this._updateMatched(filter || {}, replacement, options || {}, false);
  }

  _deleteMatched(filter, many) {
    const awt = this._awt(), b = this._base();
    const self = this;
    return store.withBatch(awt, () => {
      const meta = store.getMeta(awt, b);
      const all = self._scanAll();
      const targets = all.filter(e => matchesFilter(e.doc, filter));
      const victims = many ? targets : targets.slice(0, 1);
      for (let i = 0; i < victims.length; i++) {
        store.deleteDoc(awt, b, victims[i]._sk);
        store.removeStorageKey(awt, b, meta, victims[i]._sk);
      }
      return { acknowledged: true, deletedCount: victims.length };
    });
  }

  async deleteOne(filter) {
    return this._deleteMatched(filter || {}, false);
  }

  async deleteMany(filter) {
    return this._deleteMatched(filter || {}, true);
  }

  aggregate(pipeline, options) {
    const docs = this._scanAll().map(e => e.doc);
    return new Cursor(runPipeline(docs, pipeline || []));
  }

  async createIndex(keys, options) {
    if (!keys || typeof keys !== 'object') throw new Error('keys must be an object');
    const awt = this._awt(), b = this._base();
    const name = (options && options.name) ||
      Object.keys(keys).map(k => k + '_' + keys[k]).join('_');
    const self = this;
    return store.withBatch(awt, () => {
      const meta = store.getMeta(awt, b);
      if (!Array.isArray(meta.indexes)) meta.indexes = [];
      if (!meta.indexes.some(ix => ix.name === name)) {
        meta.indexes.push({ key: cloneVal(keys), name });
        store.setMeta(awt, b, meta);
      }
      self._register();
      // HONEST LIMITATION: index definitions are recorded for API compatibility
      // but v1 always performs collection scans (like MongoDB without a usable index).
      return name;
    });
  }

  async drop() {
    const awt = this._awt(), b = this._base();
    const self = this;
    return store.withBatch(awt, () => {
      const meta = store.getMeta(awt, b);
      const skeys = store.listStorageKeys(awt, b);
      for (let i = 0; i < skeys.length; i++) store.deleteDoc(awt, b, skeys[i]);
      for (let i = 0; i < meta.idChunks; i++) store.deleteKey(awt, store.idsKey(b, i));
      store.deleteKey(awt, store.metaKey(b));
      const ck = store.collsKey(self._db.databaseName);
      let list = store.readKey(awt, ck);
      if (Array.isArray(list)) {
        list = list.filter(n => n !== self._name);
        store.writeKey(awt, ck, list);
      }
      return true;
    });
  }
}

module.exports = { Collection, Cursor };
