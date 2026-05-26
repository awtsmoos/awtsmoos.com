//B"H
/**
 * @module packedReader
 * @description Read logical keys and list logical paths from packed shards.
 */

const { readPacked, listPackedRecords } = require('./socialPacked.js');

function readPackedKey({ $i, shard = 'core', key }) {
  if (!key) return { error: { code: 'MISSING_KEY', message: 'key is required.' } };
  const record = readPacked({ $i, shard, key });
  return record ? { success: record } : { error: { code: 'NOT_FOUND', message: 'Packed key not found.' } };
}

function listPackedKeys({ $i, shard = 'core', prefix = '', limit = 200 }) {
  const records = listPackedRecords({ $i, shard });
  const seen = new Set();
  const keys = [];
  for (const record of records) {
    if (!record.key || seen.has(record.key)) continue;
    if (prefix && !record.key.startsWith(prefix)) continue;
    seen.add(record.key);
    keys.push(record.key);
    if (keys.length >= limit) break;
  }
  return { success: keys, count: keys.length };
}

module.exports = { readPackedKey, listPackedKeys };
