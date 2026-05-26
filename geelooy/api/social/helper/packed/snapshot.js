//B"H
/**
 * @module snapshot
 * @description Compact operational snapshot of packed shards.
 */

const { allShardStats, listPackedRecords } = require('./socialPacked.js');
const { indexStats } = require('./materializedIndexes.js');

function exportPackedSnapshot({ $i }) {
  const stats = allShardStats({ $i });
  const manifests = listPackedRecords({ $i, shard: 'core' }).filter(record => record.meta?.kind === 'entityManifest');
  const migrations = listPackedRecords({ $i, shard: 'audit' }).filter(record => record.meta?.kind === 'migrationManifest');
  return {
    exportedAt: Date.now(),
    stats,
    indexStats: indexStats({ $i }),
    manifests: manifests.length,
    migrations: migrations.length,
    manifestKeys: manifests.slice(-50).map(record => record.key),
    migrationKeys: migrations.slice(-50).map(record => record.key)
  };
}

module.exports = { exportPackedSnapshot };
