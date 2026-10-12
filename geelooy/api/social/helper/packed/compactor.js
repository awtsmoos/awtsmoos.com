//B"H
/**
 * @module ShardCompactorCompat
 * @description Chapter 647: compaction became a truthful report over whichever
 * packed vessel the caller supplied. JSONL temp shards and AwtsmoosDB shards use
 * the same logical-key census without opening an unrelated default database.
 *
 * B"H 2026-10-12 (FRONT-1 api-audit): the old implementation called
 * listPackedRecords() which materializes EVERY record (the 4.5 GB core shard
 * OOM-killed the worker and the route 502'd). Now uses shardStatsAsync —
 * O(1) memory streaming aggregates — so /packed/compact stays safe.
 */
const { shardStatsAsync } = require('./socialPacked.js');
const SHARDS = ['core', 'graph', 'notify', 'audit', 'search', 'feed', 'allPosts', 'meta', 'objects', 'civilization'];

async function compactShard({ $i, shard = 'core' } = {}) {
  const stats = await shardStatsAsync({ $i, shard });
  return {
    shard,
    before: stats.records,
    after: stats.logicalKeys,
    compacted: Math.max(0, stats.records - stats.logicalKeys),
    engine: stats.engine,
    skipped: true,
    reason: 'logical_key_report',
    files: stats.files,
    bytes: stats.bytes
  };
}
async function compactAllShards({ $i } = {}) {
  const out = [];
  for (const shard of SHARDS) out.push(await compactShard({ $i, shard }));
  return out;
}
module.exports = { compactShard, compactAllShards };
