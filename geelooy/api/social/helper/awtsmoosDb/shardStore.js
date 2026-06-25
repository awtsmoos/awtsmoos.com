// B"H
/**
 * @module AwtsmoosDbShardStore
 * @description Chapter 633: logical social shards are stored through the native
 * AwtsmoosDB DosDB path API, avoiding old JSONL files and brittle live-map writes.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/dosdb/awtsmoosBinary/awtsmoosDB/index.js');
const ROOT = process.env.AWTSMOOS_SOCIAL_AWTSDB || '/storage/emulated/0/Documents/awtsmoos/dayuhChadash/social.awtsmoosdb';
const ROOT_KEY = 'socialShards';
let db;
function openDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(ROOT), { recursive: true });
  db = new AwtsmoosDB(ROOT, { compression: true, wal: true });
  db.open();
  return db;
}
function key(parts = []) {
  return parts.map(x => String(x ?? '').replace(/[\u0000/\\]/g, '_')).join('/');
}
function encode(value) { return encodeURIComponent(String(value || 'root')).replace(/%/g, '~'); }
function decode(value) { return decodeURIComponent(String(value || '').replace(/~/g, '%')); }
function pathFor(shard, parts = []) { return `${encode(shard)}/${encode(key(parts))}`; }
function shardPath(shard) { return `${encode(shard)}`; }
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function dos() { return openDb().DosDB; }
function put({ shard: shardName = 'core', parts = [], value, meta = {} }) {
  const record = { key: key(parts), parts, value: clone(value), meta: clone(meta), updatedAt: Date.now() };
  dos().write(pathFor(shardName, parts), record, { rootKey: ROOT_KEY });
  return record;
}
function get({ shard: shardName = 'core', parts = [] }) {
  const record = dos().get(pathFor(shardName, parts), { rootKey: ROOT_KEY });
  return record ? clone(record) : null;
}
function list({ shard: shardName = 'core', predicate = null } = {}) {
  const out = [];
  for (const encoded of dos().list(shardPath(shardName), { rootKey: ROOT_KEY })) {
    const record = dos().get(`${shardPath(shardName)}/${encoded}`, { rootKey: ROOT_KEY });
    if (!record) continue;
    const plain = clone(record);
    if (!predicate || predicate(plain)) out.push(plain);
  }
  return out;
}
function remove({ shard: shardName = 'core', parts = [] }) {
  return dos().delete(pathFor(shardName, parts), { rootKey: ROOT_KEY });
}
function info() { return { path: ROOT, engine: 'AwtsmoosDB', namespace: `DosDB:${ROOT_KEY}`, rootKey: ROOT_KEY }; }
module.exports = { openDb, put, get, list, remove, key, info, decode };
