//B"H
/**
 * @module SocialPackedHybrid
 * @description Chapter 644: packed mirrors now honor the vessel they are given.
 * Test/request-local `$i.db.directory` roots receive JSONL shard files, while
 * production calls without that root continue through native AwtsmoosDB shards.
 */
const fs = require('fs');
const path = require('path');
const { StringDecoder } = require('string_decoder');
const { SHARDS, logicalKey, shardFile, packedRoot } = require('./shardPaths.js');
const { RECORD_TYPES, makeEnvelope } = require('./recordEnvelope.js');
const { makeEntityManifest, entityManifestKey } = require('./entityManifest.js');
const store = require('../awtsmoosDb/shardStore.js');

function fileRoot($i) { return $i?.db?.directory || ''; }
function fileFor(root, shard) { return SHARDS[shard] ? shardFile(root, shard) : ''; }
function resolveDbRoot($i) { return fileRoot($i) || store.info().path; }
function envelope({ op = 'put', key, value, meta = {}, type }) { return makeEnvelope({ op, key, value, meta, type }); }
function readLines(file) {
  if (!file || !fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\n+/).filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}
/**
 * B"H 2026-10-11: sync chunked JSONL scan — O(1) memory, no 2 GiB limit.
 * readLines() used fs.readFileSync, which throws ERR_FS_FILE_TOO_LARGE on
 * the production core shard (3.9 GB) — that single throw 500'd every packed
 * read route AND silently emptied buildLiveHashCache (dry-run "wrote" 1011).
 * This scans in 4 MB chunks with a StringDecoder so multi-byte Hebrew is
 * never split mid-character; callers stay synchronous.
 */
function forEachFileRecord(root, shard, onRecord) {
  const file = fileFor(root, shard);
  if (!file || !fs.existsSync(file)) return;
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const CHUNK = 4 * 1024 * 1024;
    const buf = Buffer.allocUnsafe(CHUNK);
    const decoder = new StringDecoder('utf8');
    let leftover = '';
    let pos = 0;
    const handleLine = (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch (_) { return; }
      if (rec && rec.key) onRecord(rec);
    };
    while (pos < size) {
      const n = fs.readSync(fd, buf, 0, Math.min(CHUNK, size - pos), pos);
      if (n <= 0) break;
      pos += n;
      const text = leftover + decoder.write(buf.subarray(0, n));
      const lines = text.split('\n');
      leftover = lines.pop();
      for (const line of lines) handleLine(line);
    }
    handleLine(leftover + decoder.end());
  } finally {
    fs.closeSync(fd);
  }
}
/**
 * Async variant of forEachFileRecord (readline streaming): yields to the
 * event loop between chunks, so the packed read routes never block the
 * server on multi-GB shards. Same record semantics as the sync version.
 */
function forEachFileRecordAsync(root, shard, onRecord) {
  return new Promise((resolve) => {
    const file = fileFor(root, shard);
    if (!file || !fs.existsSync(file)) return resolve();
    const rl = require('readline').createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch (_) { return; }
      if (rec && rec.key) {
        try { onRecord(rec); } catch (_) { /* ignore */ }
      }
    });
    rl.on('close', () => resolve());
    rl.on('error', () => resolve());
  });
}
function writeFileRecord(root, shard, record) {
  const file = fileFor(root, shard);
  if (!file) return null;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(record) + '\n');
  return record;
}
function latestFileRecords(root, shard) {
  const latest = new Map();
  forEachFileRecord(root, shard, (record) => latest.set(record.key, record));
  return [...latest.values()];
}
async function latestFileRecordsAsync(root, shard) {
  const latest = new Map();
  await forEachFileRecordAsync(root, shard, (record) => latest.set(record.key, record));
  return [...latest.values()];
}
function writePacked({ $i, shard = 'core', key, value, op = 'put', meta = {}, type }) {
  const record = envelope({ op, key, value, meta, type });
  const root = fileRoot($i);
  if (root) return writeFileRecord(root, shard, record) || record;
  try { store.put({ shard, parts: ['records', key], value: record, meta: { ...meta, compat: 'awtsmoosdb-shard' } }); }
  catch (error) { record.mirrorError = String(error.message || error); }
  return record;
}
function readPacked({ $i, shard = 'core', key }) {
  const root = fileRoot($i);
  if (root) {
    // Append-only JSONL: the LAST record for a key wins — full scan, O(1) memory.
    let found = null;
    forEachFileRecord(root, shard, (record) => { if (record.key === key) found = record; });
    return found;
  }
  try { return store.get({ shard, parts: ['records', key] })?.value || null; } catch { return null; }
}
async function readPackedAsync({ $i, shard = 'core', key }) {
  const root = fileRoot($i);
  if (root) {
    let found = null;
    await forEachFileRecordAsync(root, shard, (record) => { if (record.key === key) found = record; });
    return found;
  }
  try { return store.get({ shard, parts: ['records', key] })?.value || null; } catch { return null; }
}
function listPackedRecords({ $i, shard = 'core' } = {}) {
  const root = fileRoot($i);
  if (root) return latestFileRecords(root, shard);
  const latest = new Map();
  try {
    for (const record of store.list({ shard, predicate: r => r.parts?.[0] === 'records' })) if (record.value?.key) latest.set(record.value.key, record.value);
  } catch { return []; }
  return [...latest.values()];
}
async function listPackedRecordsAsync({ $i, shard = 'core' } = {}) {
  const root = fileRoot($i);
  if (root) return latestFileRecordsAsync(root, shard);
  return listPackedRecords({ $i, shard });
}
function writeManifest({ $i, manifest }) { return writePacked({ $i, shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: manifest.kind } }); }
function writeIndex({ $i, key, value, meta }) { return writePacked({ $i, shard: 'search', key, value, meta: { kind: 'materializedIndex', ...meta } }); }
function appendEvent({ $i, type, actor = '', entity = {}, data = {} }) {
  const event = { id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`, type, actor, entity, data, createdAt: Date.now() };
  return writePacked({ $i, shard: 'audit', key: logicalKey(['events', type, event.id]), value: event, meta: { kind: 'socialEvent', type } });
}
function allPostValue(post) {
  const postId = post.id || post.postId;
  return { postId, heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || 'root', aliasId: post.aliasId || post.author || '', type: post.contentType || post.postType || 'post', title: post.title || post.name || '', excerpt: String(post.content || post.description || '').slice(0, 280), connected: true, updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now() };
}
function mirrorAllPost({ $i, post }) {
  const value = allPostValue(post);
  return writePacked({ $i, shard: 'allPosts', key: logicalKey(['allPosts', value.heichelId, value.postId]), value, meta: { kind: 'allPost', aliasId: value.aliasId, heichelId: value.heichelId, seriesId: value.seriesId } });
}
function indexPost({ $i, value }) {
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByHeichel', value.heichelId, value.postId]), value, meta: { index: 'postsByHeichel' } });
  if (value.aliasId) writeIndex({ $i, key: logicalKey(['indexes', 'postsByAlias', value.aliasId, value.postId]), value, meta: { index: 'postsByAlias' } });
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByType', value.type, value.postId]), value, meta: { index: 'postsByType' } });
}
function mirrorPost({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const coreKey = logicalKey(['posts', post.heichelId, postId]);
  const write = writePacked({ $i, shard: 'core', key: coreKey, value: post, meta: { kind: 'post', type: contentType } });
  const allPost = mirrorAllPost({ $i, post }).value;
  writeManifest({ $i, manifest: makeEntityManifest({ kind: 'post', id: postId, paths: { core: coreKey, allPosts: logicalKey(['allPosts', post.heichelId, postId]) }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]) }, binaryRefs: { engine: fileRoot($i) ? 'JSONL' : 'AwtsmoosDB' }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } }) });
  indexPost({ $i, value: allPost });
  appendEvent({ $i, type: 'post.mirrored', actor: allPost.aliasId, entity: { kind: 'post', id: postId }, data: { heichelId: post.heichelId, contentType } });
  return write;
}
/**
 * Bulk-optimized post writer for the import job (Yaakov 2026-10-11:
 * bulk importer is #1 priority — reliable, reusable, fast).
 * Same records as mirrorPost (core, allPosts mirror, entity manifest,
 * search indexes) but WITHOUT the per-post audit event — the import job's
 * own job log (post-import-jobs.log) is the audit trail for bulk runs.
 * Callers yield to the event loop between posts; the JSONL appends here
 * are individually fast.
 */
function mirrorPostBulk({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const coreKey = logicalKey(['posts', post.heichelId, postId]);
  const write = writePacked({ $i, shard: 'core', key: coreKey, value: post, meta: { kind: 'post', type: contentType } });
  const allPost = mirrorAllPost({ $i, post }).value;
  writeManifest({ $i, manifest: makeEntityManifest({ kind: 'post', id: postId, paths: { core: coreKey, allPosts: logicalKey(['allPosts', post.heichelId, postId]) }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]) }, binaryRefs: { engine: fileRoot($i) ? 'JSONL' : 'AwtsmoosDB' }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } }) });
  indexPost({ $i, value: allPost });
  return write;
}
function indexGraph({ $i, reference }) {
  const value = { id: reference.id, kind: reference.kind, from: reference.from, to: reference.to, updatedAt: Date.now() };
  writeIndex({ $i, key: logicalKey(['indexes', 'graphOut', reference.from?.type, reference.from?.id, reference.id]), value, meta: { index: 'graphOut', edgeKind: reference.kind } });
  writeIndex({ $i, key: logicalKey(['indexes', 'graphIn', reference.to?.type, reference.to?.id, reference.id]), value, meta: { index: 'graphIn', edgeKind: reference.kind } });
}
function mirrorGraphReference({ $i, reference }) {
  const write = writePacked({ $i, shard: 'graph', key: logicalKey(['graph', reference.kind, reference.id]), value: reference, type: RECORD_TYPES.graphEdge, meta: { kind: 'graph', edgeKind: reference.kind } });
  indexGraph({ $i, reference });
  appendEvent({ $i, type: 'graph.edge.mirrored', actor: reference.aliasId || '', entity: { kind: 'graphEdge', id: reference.id }, data: { edgeKind: reference.kind } });
  return write;
}
function mirrorNotification({ $i, notification }) {
  const write = writePacked({ $i, shard: 'notify', key: logicalKey(['notifications', notification.toAliasId, notification.id]), value: notification, type: RECORD_TYPES.notification, meta: { kind: 'notification', type: notification.type } });
  appendEvent({ $i, type: 'notification.mirrored', actor: notification.fromAliasId || '', entity: { kind: 'notification', id: notification.id }, data: { toAliasId: notification.toAliasId, type: notification.type } });
  return write;
}
function shardFileStats({ $i, shard }) {
  const root = fileRoot($i);
  const file = root ? fileFor(root, shard) : resolveDbRoot($i);
  const exists = Boolean(file && fs.existsSync(file));
  const stat = exists ? fs.statSync(file) : null;
  return { files: [{ file, exists, bytes: stat?.size || 0, mtimeMs: stat?.mtimeMs || 0, engine: root ? 'JSONL' : 'AwtsmoosDB', shard }], bytes: stat?.size || 0 };
}
function shardStats({ $i, shard = 'core' }) {
  const records = listPackedRecords({ $i, shard });
  const byType = {};
  for (const r of records) byType[r.recordType || r.meta?.kind || 'unknown'] = (byType[r.recordType || r.meta?.kind || 'unknown'] || 0) + 1;
  return { shard, records: records.length, logicalKeys: new Set(records.map(r => r.key).filter(Boolean)).size, byType, approximate: false, engine: fileRoot($i) ? 'JSONL' : 'AwtsmoosDB', bytes: shardFileStats({ $i, shard }).bytes, files: shardFileStats({ $i, shard }).files };
}
function allShardStats({ $i } = {}) { return ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search', 'feed'].map(shard => shardStats({ $i, shard })); }
async function shardStatsAsync({ $i, shard = 'core' }) {
  const records = await listPackedRecordsAsync({ $i, shard });
  const byType = {};
  for (const r of records) byType[r.recordType || r.meta?.kind || 'unknown'] = (byType[r.recordType || r.meta?.kind || 'unknown'] || 0) + 1;
  return { shard, records: records.length, logicalKeys: new Set(records.map(r => r.key).filter(Boolean)).size, byType, approximate: false, engine: fileRoot($i) ? 'JSONL' : 'AwtsmoosDB', bytes: shardFileStats({ $i, shard }).bytes, files: shardFileStats({ $i, shard }).files };
}
async function allShardStatsAsync({ $i } = {}) {
  const out = [];
  for (const shard of ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search', 'feed']) out.push(await shardStatsAsync({ $i, shard }));
  return out;
}
function writeMigrationManifest({ $i, manifest }) { return writePacked({ $i, shard: 'meta', key: logicalKey(['migrations', manifest.id]), value: manifest, type: RECORD_TYPES.migrationManifest, meta: { kind: 'migrationManifest', migrationType: manifest.type } }); }
module.exports = { resolveDbRoot, writePacked, readPacked, readPackedAsync, listPackedRecords, listPackedRecordsAsync, forEachFileRecord, forEachFileRecordAsync, writeManifest, writeIndex, appendEvent, mirrorPost, mirrorPostBulk, mirrorAllPost, mirrorGraphReference, mirrorNotification, writeMigrationManifest, shardStats, shardStatsAsync, allShardStats, allShardStatsAsync, shardFileStats };
