// B"H

/**
 * @file api/mongo/index.js
 * @chapter Documents Wearing A Familiar Coat
 * @description Mongo-style collection API backed by AwtsmoosDB.
 */

/**
 * @class MongoFacade
 * @description Minimal MongoDB-compatible layer.
 */
class MongoFacade {
  constructor(db) {
    this.db = db;
    this.fresh = new Map();
  }
  collection(name) { return new Collection(this.db, name, this.fresh); }
}

class Collection {
  constructor(db, name, fresh) { this.db = db; this.name = name; this.fresh = fresh; }
  root() {
    if (!this.db.root.__mongo__) this.db.root.__mongo__ = {};
    if (!this.db.root.__mongo__[this.name]) this.db.root.__mongo__[this.name] = { seq: 0, docs: {}, list: [] };
    return this.db.root.__mongo__[this.name];
  }
  insertOne(doc) {
    const root = this.root();
    const id = String(doc._id || Number(root.seq || 0) + 1);
    root.seq = Math.max(Number(root.seq || 0), Number(id) || 0);
    root.docs[id] = { ...doc, _id: id };
    this.freshDocs().set(id, root.docs[id]);
    root.list = Array.from(this.freshDocs().values());
    this.writeFlat(root.list);
    return { acknowledged: true, insertedId: id };
  }
  insertMany(docs) { return { insertedIds: docs.map((doc) => this.insertOne(doc).insertedId) }; }
  find(query = {}) { return this.all().filter((doc) => matches(doc, query)); }
  findOne(query = {}) { return this.find(query)[0] || null; }
  updateOne(query, update) { return this.updateMany(query, update, 1); }
  updateMany(query, update, limit = Infinity) {
    let count = 0;
    const root = this.root();
    for (const [id, doc] of this.entries(root)) {
      if (count >= limit) break;
      if (!matches(doc, query)) continue;
      applyUpdate(doc, update);
      root.docs[id] = doc;
      this.freshDocs().set(String(id), doc);
      count++;
    }
    root.list = Array.from(this.freshDocs().values());
    this.writeFlat(root.list);
    return { matchedCount: count, modifiedCount: count };
  }
  deleteOne(query) { return this.deleteMany(query, 1); }
  deleteMany(query, limit = Infinity) {
    let count = 0;
    const root = this.root();
    for (const [id, doc] of this.entries(root)) {
      if (count >= limit) break;
      if (matches(doc, query)) {
        delete root.docs[id];
        this.freshDocs().delete(String(id));
        count++;
      }
    }
    root.list = Array.from(this.freshDocs().values());
    this.writeFlat(root.list);
    return { deletedCount: count };
  }
  all() {
    const root = this.root();
    const out = [];
    const seen = new Set();
    const add = (id, doc) => {
      if (!seen.has(id) && doc) {
        seen.add(id);
        out.push(doc);
      }
    };
    for (const doc of plainArray(this.flat())) add(String(doc._id), doc);
    for (const doc of plainArray(root.list)) add(String(doc._id), doc);
    try {
      for (const id of this.db.keys(root.docs, { limit: Infinity })) add(String(id), root.docs[id]);
    } catch (_err) {}
    for (const [id, doc] of this.freshDocs()) add(String(id), doc);
    return out;
  }
  entries(root) {
    const map = new Map();
    try {
      for (const id of this.db.keys(root.docs, { limit: Infinity })) map.set(String(id), root.docs[id]);
    } catch (_err) {}
    for (const [id, doc] of this.freshDocs()) map.set(String(id), doc);
    return map;
  }
  freshDocs() {
    if (!this.fresh.has(this.name)) this.fresh.set(this.name, new Map());
    return this.fresh.get(this.name);
  }
  flat() {
    return this.db.root[this.flatKey()];
  }
  writeFlat(list) {
    this.db.root[this.flatKey()] = list;
  }
  flatKey() {
    return `__mongo_flat_${this.name}`;
  }
}

function matches(doc, query) {
  return Object.keys(query || {}).every((key) => {
    const rule = query[key];
    const value = doc[key];
    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) return value === rule;
    if ('$gt' in rule && !(value > rule.$gt)) return false;
    if ('$lt' in rule && !(value < rule.$lt)) return false;
    if ('$in' in rule && !rule.$in.includes(value)) return false;
    return true;
  });
}

function applyUpdate(doc, update) {
  if (update.$set) for (const key of Object.keys(update.$set)) doc[key] = update.$set[key];
  if (update.$inc) for (const key of Object.keys(update.$inc)) doc[key] = Number(doc[key] || 0) + update.$inc[key];
}

function mutateClone(doc, update) {
  const copy = { ...doc };
  applyUpdate(copy, update);
  return copy;
}

function plainArray(value) {
  const plain = value && value.__resolve__ ? value.__resolve__() : value;
  return Array.isArray(plain) ? plain : [];
}

module.exports = MongoFacade;
