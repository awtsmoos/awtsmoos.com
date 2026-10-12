//B"H
/**
 * @module ShardReaderCompat
 * @description Chapter 646: logical-key reads now keep the caller's `$i`
 * vessel, so tests and requests see their own JSONL or AwtsmoosDB shard root.
 */
const { readPacked, readPackedAsync, listPackedRecords, listPackedRecordsAsync, listKeysReverseAsync, findKeyReverseAsync, findKeySuffixReverseAsync } = require('./socialPacked.js');
function readPackedKey({ $i, shard = 'core', key }) {
  if (!key) return { error: { code: 'MISSING_KEY', message: 'key is required.' } };
  const record = readPacked({ $i, shard, key });
  return record ? { success: record } : { error: { code: 'NOT_FOUND', message: 'Record key not found.' } };
}
async function readPackedKeyAsync({ $i, shard = 'core', key }) {
  if (!key) return { error: { code: 'MISSING_KEY', message: 'key is required.' } };
  // B"H 2026-10-11: reverse scan — newest record first, stops at first hit;
  // never loads multi-GB shards (the forward scan OOMed the server).
  let record = await findKeyReverseAsync({ $i, shard, key });
  // B"H 2026-10-12 (FRONT-1 api-audit): bare postIds (?key=<postId>) never
  // match the stored logical keys (/posts/<heichel>/<postId>) — fall back
  // to a final-segment suffix match so the read path finds records by postId.
  if (!record && typeof key === 'string' && !key.includes('/')) {
    record = await findKeySuffixReverseAsync({ $i, shard, postId: key });
  }
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
async function listPackedKeysAsync({ $i, shard = 'core', prefix = '', limit = 200 }) {
  const safeLimit = safePositive(limit, 200, 2000);
  // B"H 2026-10-11: reverse scan — exact latest-wins keys from the tail of
  // the shard; O(limit) memory instead of loading all records (OOM).
  const keys = await listKeysReverseAsync({ $i, shard, prefix, limit: safeLimit });
  return { success: keys, count: keys.length, bounded: true, limit: safeLimit, engine: $i?.db?.directory ? 'JSONL' : 'AwtsmoosDB' };
}
function scanFileForKeys({ $i } = {}) {
  return { exists: Boolean($i?.db?.directory), engine: $i?.db?.directory ? 'JSONL' : 'AwtsmoosDB', note: 'Logical records are read through socialPacked hybrid shards.' };
}
module.exports = { readPackedKey, readPackedKeyAsync, listPackedKeys, listPackedKeysAsync, scanFileForKeys };
