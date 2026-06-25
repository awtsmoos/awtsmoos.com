//B"H
/**
 * @module ShardReaderCompat
 * @description Chapter 621: logical-key reading remains for old routes, but the
 * source is now AwtsmoosDB records, not JSONL files.
 */
const { readPacked, listPackedRecords } = require('./socialPacked.js');
function readPackedKey({ shard = 'core', key }) {
  if (!key) return { error: { code: 'MISSING_KEY', message: 'key is required.' } };
  const record = readPacked({ shard, key });
  return record ? { success: record } : { error: { code: 'NOT_FOUND', message: 'Record key not found.' } };
}
function safePositive(value, fallback, ceiling) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.max(1, Math.min(Math.floor(number), ceiling));
}
function listPackedKeys({ shard = 'core', prefix = '', limit = 200 }) {
  const safeLimit = safePositive(limit, 200, 2000);
  const keys = [];
  const seen = new Set();
  for (const record of listPackedRecords({ shard })) {
    if (!record?.key || seen.has(record.key)) continue;
    if (prefix && !record.key.startsWith(prefix)) continue;
    seen.add(record.key);
    keys.push(record.key);
    if (keys.length >= safeLimit) break;
  }
  return { success: keys, count: keys.length, bounded: true, limit: safeLimit, engine: 'AwtsmoosDB' };
}
function scanFileForKeys() {
  return { exists: false, engine: 'AwtsmoosDB', note: 'File scanning disabled; records live in native AwtsmoosDB shards.' };
}
module.exports = { readPackedKey, listPackedKeys, scanFileForKeys };
