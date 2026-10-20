//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked shard file and record statistics, sync and async (split from socialPacked.js).
 */
const fs = require('fs');
const { engineFor, effectiveRoot, fileFor, resolveDbRoot } = require('./socialPackedEngine.js');
const store = require('../awtsmoosDb/shardStore.js');
const { listPackedRecords } = require('./socialPackedList.js');
const { forEachLineFastAsync } = require('./socialPackedLineFast.js');
const { fastKeyType } = require('./socialPackedFastKey.js');
function shardFileStats({ $i, shard }) {
  const engine = engineFor($i, shard);
  const file = engine === 'JSONL' ? fileFor(effectiveRoot($i, shard), shard) : resolveDbRoot($i);
  const exists = Boolean(file && fs.existsSync(file));
  const stat = exists ? fs.statSync(file) : null;
  return { files: [{ file, exists, bytes: stat?.size || 0, mtimeMs: stat?.mtimeMs || 0, engine, shard }], bytes: stat?.size || 0 };
}
function shardStats({ $i, shard = 'core' }) {
  const records = listPackedRecords({ $i, shard });
  const byType = {};
  for (const r of records) byType[r.recordType || r.meta?.kind || 'unknown'] = (byType[r.recordType || r.meta?.kind || 'unknown'] || 0) + 1;
  return { shard, records: records.length, logicalKeys: new Set(records.map(r => r.key).filter(Boolean)).size, byType, approximate: false, engine: engineFor($i, shard), bytes: shardFileStats({ $i, shard }).bytes, files: shardFileStats({ $i, shard }).files };
}
function allShardStats({ $i } = {}) { return ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search', 'feed'].map(shard => shardStats({ $i, shard })); }
async function shardStatsAsync({ $i, shard = 'core' }) {
  // B"H 2026-10-11: exact aggregates WITHOUT retaining records — the core
  // shard is 3.9 GB and holding parsed values OOMs the server. We retain
  // only key -> type (~2 MB for 21k keys) and extract key/type/op without
  // JSON.parse (fast path; JSON.parse fallback per line when needed).
  const types = new Map();
  const recordOne = (key, type, op) => {
    if (!key) return;
    if (op === 'del') { types.delete(key); return; }
    types.set(key, type || 'unknown');
  };
  if (engineFor($i, shard) === 'JSONL') {
    const root = effectiveRoot($i, shard);
    // Forward raw-line scan with fast key/type extraction (no JSON.parse):
    // chunked ~4 MB reads with event-loop yields — the 3.9 GB core shard
    // finishes inside nginx's timeout instead of 504ing.
    await forEachLineFastAsync(root, shard, (head, getFull) => {
      const fast = fastKeyType(head);
      if (fast) { recordOne(fast.key, fast.type, fast.op); return; }
      try {
        const rec = JSON.parse(getFull());
        if (rec && rec.key) recordOne(rec.key, rec.recordType || (rec.meta && rec.meta.kind), rec.op);
      } catch (_) { /* skip corrupt line */ }
    });
  } else {
    try {
      for (const record of store.list({ shard, predicate: r => r.parts?.[0] === 'records' })) {
        const v = record.value || {};
        recordOne(v.key, v.recordType || (v.meta && v.meta.kind), v.op);
      }
    } catch (_) { /* ignore */ }
  }
  const byType = {};
  for (const t of types.values()) byType[t] = (byType[t] || 0) + 1;
  return { shard, records: types.size, logicalKeys: types.size, byType, approximate: false, engine: engineFor($i, shard), bytes: shardFileStats({ $i, shard }).bytes, files: shardFileStats({ $i, shard }).files };
}
async function allShardStatsAsync({ $i } = {}) {
  const out = [];
  for (const shard of ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search', 'feed']) out.push(await shardStatsAsync({ $i, shard }));
  return out;
}
module.exports = { shardFileStats, shardStats, allShardStats, shardStatsAsync, allShardStatsAsync };
