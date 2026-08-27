// B"H
/** Chapter 619: Universal Objects now dwell in AwtsmoosDB shards, with
 * tombstones in the same native binary store instead of packed audit mirrors.
 */
const { put, get, list } = require('../awtsmoosDb/shardStore.js');
const { normalizeObject } = require('./schema.js');
function parts(object) { return ['objects', object.type, object.id]; }
function keyParts(type, id) { return ['objects', type, id]; }
function value(record) { return record?.value || record; }
function isLive(object) { return object && object.lifecycle !== 'deleted'; }
function byTime(a, b) { return Number(b.updatedAt || 0) - Number(a.updatedAt || 0); }
function saveObject({ input = {} }) {
  const object = normalizeObject(input);
  put({ shard: 'objects', parts: parts(object), value: object, meta: { kind: 'universalObject', type: object.type, objectKey: object.key } });
  return { success: object };
}
function deleteObject({ type, id, reason = 'deleted' }) {
  const existing = getObject({ type, id }).success || { type, id, key: `${type}:${id}`, title: id };
  const tombstone = { ...existing, lifecycle: 'deleted', deletedAt: Date.now(), deleteReason: reason, updatedAt: Date.now() };
  put({ shard: 'objects', parts: keyParts(type, id), value: tombstone, meta: { kind: 'universalObject', type, objectKey: tombstone.key, tombstone: true } });
  return { success: tombstone };
}
function getObject({ type, id, includeDeleted = false }) {
  const found = get({ shard: 'objects', parts: keyParts(type, id) });
  const object = value(found);
  if (object && (includeDeleted || isLive(object))) return { success: object };
  return { error: { code: 'OBJECT_NOT_FOUND', message: `${type}:${id} not found.` } };
}
function listObjects({ query = {}, limit = 100 }) {
  const q = String(query.q || '').toLowerCase();
  const latest = new Map();
  for (const record of list({ shard: 'objects', predicate: r => r.meta?.kind === 'universalObject' })) {
    const object = value(record);
    if (object?.key) latest.set(object.key, object);
  }
  const rows = [...latest.values()]
    .filter(isLive)
    .filter(o => (!query.type || o.type === query.type) && (!q || JSON.stringify(o).toLowerCase().includes(q)))
    .sort(byTime)
    .slice(0, Number(limit || 100));
  return { success: rows };
}
module.exports = { saveObject, deleteObject, getObject, listObjects };
