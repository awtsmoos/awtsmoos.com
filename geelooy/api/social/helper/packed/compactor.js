//B"H
/**
 * @module shardCompactorCompat
 * @description Chapter 630: AwtsmoosDB shards are key-addressed native maps, so
 * compaction is now a no-file verification report, not a JSONL rewrite.
 */
const { list, info } = require('../awtsmoosDb/shardStore.js');
function compactShard({ shard = 'core' }) {
  const records = list({ shard });
  const logicalKeys = new Set(records.map(record => record.key).filter(Boolean));
  return { shard, before: records.length, after: logicalKeys.size, compacted: 0, engine: 'AwtsmoosDB', skipped: true, reason: 'native_keyed_store', db: info() };
}
function compactAllShards() {
  return ['core', 'graph', 'notify', 'events', 'search', 'feed', 'allPosts', 'meta', 'objects', 'civilization'].map(shard => compactShard({ shard }));
}
module.exports = { compactShard, compactAllShards };
