// B"H
/**
 * @module AwtsmoosDbShardStore
 * @description
 * Chapter 640: the social route gate may not shatter because one filesystem
 * spells DosDB with a different crown. The engine is resolved from real paths
 * at runtime, so old API/social endpoints can breathe before any NodeOS shard
 * is touched.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.env.AWTSMOOS_SOCIAL_AWTSDB || '/storage/emulated/0/Documents/awtsmoos/dayuhChadash/social.awtsmoosdb';
const ROOT_KEY = 'socialShards';
let db;
let Engine;

function rootCandidates() {
  const here = __dirname;
  const repoFromHere = path.resolve(here, '../../../../..');
  const cwd = process.cwd();
  return [repoFromHere, cwd, path.resolve(cwd, '..')].filter(Boolean);
}

function engineCandidates() {
  const out = [];
  if (process.env.AWTSMOOS_DB_ENGINE) out.push(process.env.AWTSMOOS_DB_ENGINE);
  for (const root of rootCandidates()) {
    out.push(path.join(root, 'ayzarim/dosdb/awtsmoosBinary/awtsmoosDB/index.js'));
    out.push(path.join(root, 'ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js'));
    out.push(path.join(root, 'ayzarim/dosdb/index.js'));
    out.push(path.join(root, 'ayzarim/DosDB/index.js'));
  }
  return [...new Set(out)];
}

function resolveEngine() {
  if (Engine) return Engine;
  const misses = [];
  for (const candidate of engineCandidates()) {
    try {
      if (!candidate || !fs.existsSync(candidate)) { misses.push(candidate); continue; }
      Engine = require(candidate);
      return Engine;
    } catch (error) { misses.push(`${candidate} :: ${error.message}`); }
  }
  const message = `AwtsmoosDB engine not found. Tried: ${misses.filter(Boolean).join(' | ')}`;
  throw new Error(message);
}

function openDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(ROOT), { recursive: true });
  const AwtsmoosDB = resolveEngine();
  db = new AwtsmoosDB(ROOT, { compression: true, wal: true });
  db.open();
  return db;
}
function key(parts = []) { return parts.map(x => String(x ?? '').replace(/[\u0000/\\]/g, '_')).join('/'); }
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
  for (const encodedKey of dos().list(shardPath(shardName), { rootKey: ROOT_KEY })) {
    const record = dos().get(`${shardPath(shardName)}/${encodedKey}`, { rootKey: ROOT_KEY });
    if (!record) continue;
    const plain = clone(record);
    if (!predicate || predicate(plain)) out.push(plain);
  }
  return out;
}
function remove({ shard: shardName = 'core', parts = [] }) { return dos().delete(pathFor(shardName, parts), { rootKey: ROOT_KEY }); }
function info() { return { path: ROOT, engine: 'AwtsmoosDB', namespace: `DosDB:${ROOT_KEY}`, rootKey: ROOT_KEY, engineLoaded: Boolean(Engine) }; }

module.exports = { openDb, put, get, list, remove, key, info, decode, resolveEngine };
