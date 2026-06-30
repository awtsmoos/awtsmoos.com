//B"H
/**
 * @module ShardReaderCompat
 * @description Chapter 646: logical-key reads now keep the caller's `$i`
 * vessel, so tests and requests see their own JSONL or AwtsmoosDB shard root.
 */
const { readPacked, listPackedRecords } = require('./socialPacked.js');
function readPackedKey({ $i, shard = 'core', key }) {
  if (!key) return { error: { code: 'MISSING_KEY', message: 'key is required.' } };
  const record = readPacked({ $i, shard, key });
  return record ? { success: record } : { error: { code: 'NOT_FOUND', message: 'Record key not found.' } };
}
function safePositive(value, fallback, ceiling) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.max(1, Math.min(Math.floor(number), ceiling));
}
function listPackedKeys({ $i, shard = 'core', prefix = '', limit = 200 }) {
  const safeLimit = safePositive(limit, 200, 2000);
  const keys = [];
  const seen = new Set();
  for (const record of listPackedRecords({ $i, shard })) {
    if (!record?.key || seen.has(record.key)) continue;
    if (prefix && !record.key.startsWith(prefix)) continue;
    seen.add(record.key);
    keys.push(record.key);
    if (keys.length >= safeLimit) break;
  }
  return { success: keys, count: keys.length, bounded: true, limit: safeLimit, engine: $i?.db?.directory ? 'JSONL' : 'AwtsmoosDB' };
}
function scanFileForKeys({ $i } = {}) {
  return { exists: Boolean($i?.db?.directory), engine: $i?.db?.directory ? 'JSONL' : 'AwtsmoosDB', note: 'Logical records are read through socialPacked hybrid shards.' };
}
module.exports = { readPackedKey, listPackedKeys, scanFileForKeys };
