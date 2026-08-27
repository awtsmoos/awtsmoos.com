//B"H
/**
 * @module snapshot
 * @description
 * Chapter 8: The watchman learned not to count every grain.
 * Snapshot is an operational heartbeat, not a full replay of every packed core
 * record. It reports lightweight shard file signatures, while keeping exact
 * manifest and materialized-index counts from the smaller metadata/search
 * vessels.
 */

const fs = require('fs');
const { SHARDS, shardFilesForRead } = require('./shardPaths.js');
const { resolveDbRoot, listPackedRecords } = require('./socialPacked.js');
const { indexStats } = require('./materializedIndexes.js');

function fileStat(file) {
  try {
    const stat = fs.statSync(file);
    return { file, exists: true, bytes: stat.size, mtimeMs: stat.mtimeMs };
  } catch {
    return { file, exists: false, bytes: 0, mtimeMs: 0 };
  }
}

function lightweightShardStats({ $i }) {
  const dbRoot = resolveDbRoot($i);
  return Object.keys(SHARDS).map(shard => {
    const files = shardFilesForRead(dbRoot, shard).map(fileStat);
    const bytes = files.reduce((sum, item) => sum + item.bytes, 0);
    return { shard, records: null, logicalKeys: null, approximate: true, bytes, files };
  });
}

function metaSnapshot($i) {
  const meta = listPackedRecords({ $i, shard: 'meta' });
  const manifests = meta.filter(record => record.meta?.kind === 'entityManifest');
  const migrations = meta.filter(record => record.meta?.kind === 'migrationManifest');
  return { manifests, migrations };
}

function exportPackedSnapshot({ $i }) {
  const meta = metaSnapshot($i);
  return {
    exportedAt: Date.now(),
    stats: lightweightShardStats({ $i }),
    indexStats: indexStats({ $i }),
    manifests: meta.manifests.length,
    migrations: meta.migrations.length,
    manifestKeys: meta.manifests.slice(-50).map(record => record.key),
    migrationKeys: meta.migrations.slice(-50).map(record => record.key)
  };
}

module.exports = { exportPackedSnapshot, lightweightShardStats };
