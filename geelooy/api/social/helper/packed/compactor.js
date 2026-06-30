//B"H
/**
 * @module ShardCompactorCompat
 * @description Chapter 647: compaction became a truthful report over whichever
 * packed vessel the caller supplied. JSONL temp shards and AwtsmoosDB shards use
 * the same logical-key census without opening an unrelated default database.
 */
const { listPackedRecords, shardFileStats } = require('./socialPacked.js');
const SHARDS = ['core', 'graph', 'notify', 'audit', 'search', 'feed', 'allPosts', 'meta', 'objects', 'civilization'];

function compactShard({ $i, shard = 'core' } = {}) {
  const records = listPackedRecords({ $i, shard });
  const logicalKeys = new Set(records.map(record => record.key).filter(Boolean));
  const stats = shardFileStats({ $i, shard });
  return {
    shard,
    before: records.length,
    after: logicalKeys.size,
    compacted: Math.max(0, records.length - logicalKeys.size),
    engine: $i?.db?.directory ? 'JSONL' : 'AwtsmoosDB',
    skipped: true,
    reason: 'logical_key_report',
    files: stats.files,
    bytes: stats.bytes
  };
}
function compactAllShards({ $i } = {}) { return SHARDS.map(shard => compactShard({ $i, shard })); }
module.exports = { compactShard, compactAllShards };
