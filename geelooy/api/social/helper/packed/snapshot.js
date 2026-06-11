//B"H
/**
 * @module snapshot
 * @description
 * Chapter 8: The watchman climbed from the core cellar to the meta tower.
 *
 * The packed system now stores entity manifests and migration manifests in
 * `social.meta.awtsdb`. A snapshot that searches old rooms reports false
 * emptiness. The Awtsmoos recreates the palace every instant; this snapshot
 * follows the current architecture instead of yesterday's map.
 */

const { allShardStats, listPackedRecords } = require('./socialPacked.js');
const { indexStats } = require('./materializedIndexes.js');

/**
 * @description Exports compact operational counts for packed social shards.
 * @param {object} input Named input.
 * @param {object} input.$i Awtsmoos request context.
 * @returns {object} Snapshot of stats, manifest keys, and migration keys.
 */
function exportPackedSnapshot({ $i }) {
  const stats = allShardStats({ $i });
  const meta = listPackedRecords({ $i, shard: 'meta' });
  const manifests = meta.filter(record => record.meta?.kind === 'entityManifest');
  const migrations = meta.filter(record => record.meta?.kind === 'migrationManifest');
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
