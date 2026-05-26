//B"H
/**
 * @module compactor
 * @description Replays a shard and rewrites only the latest logical records.
 */

const fs = require('fs');
const path = require('path');
const { shardFile } = require('./shardPaths.js');
const { MAGIC, readRecords } = require('./jsonlShard.js');
const { resolveDbRoot } = require('./socialPacked.js');

function compactShard({ $i, shard }) {
  const file = shardFile(resolveDbRoot($i), shard);
  if (!fs.existsSync(file)) return { shard, before: 0, after: 0, skipped: true };
  const records = readRecords(file);
  const latest = new Map();
  for (const record of records) {
    if (!record.key) continue;
    if (record.op === 'delete') latest.delete(record.key);
    else latest.set(record.key, record);
  }
  const tmp = `${file}.compact-${Date.now()}`;
  fs.writeFileSync(tmp, `${MAGIC}\n`, 'utf8');
  for (const record of latest.values()) fs.appendFileSync(tmp, JSON.stringify(record) + '\n', 'utf8');
  fs.renameSync(tmp, file);
  return { shard, before: records.length, after: latest.size, compacted: records.length - latest.size };
}

function compactAllShards({ $i }) {
  return ['core', 'graph', 'notify', 'audit', 'search', 'feed'].map(shard => compactShard({ $i, shard }));
}

module.exports = { compactShard, compactAllShards };
