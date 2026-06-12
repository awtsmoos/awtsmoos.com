//B"H
/**
 * @module packedReader
 * @description
 * Read logical keys and list logical paths from packed shards without replaying
 * the whole sea for a bounded key listing. The Awtsmoos asks for a cup; this
 * file no longer drains the ocean.
 */

const fs = require('fs');
const { readPacked, resolveDbRoot } = require('./socialPacked.js');
const { shardFilesForRead } = require('./shardPaths.js');

const MAGIC = 'BH_AWTSOCIAL_JSONL_V1';
const CHUNK = 64 * 1024;

function readPackedKey({ $i, shard = 'core', key }) {
  if (!key) return { error: { code: 'MISSING_KEY', message: 'key is required.' } };
  const record = readPacked({ $i, shard, key });
  return record ? { success: record } : { error: { code: 'NOT_FOUND', message: 'Packed key not found.' } };
}

function parseKey(line) {
  try { return JSON.parse(line).key || ''; } catch { return ''; }
}

function acceptKey({ key, prefix, seen, keys, limit }) {
  if (!key || seen.has(key)) return false;
  if (prefix && !key.startsWith(prefix)) return false;
  seen.add(key);
  keys.push(key);
  return keys.length >= limit;
}

function scanFileForKeys({ file, prefix, limit, seen, keys }) {
  if (!fs.existsSync(file) || keys.length >= limit) return;
  const fd = fs.openSync(file, 'r');
  const buffer = Buffer.alloc(CHUNK);
  let carry = '';
  let position = 0;
  let firstLine = true;
  try {
    while (keys.length < limit) {
      const bytes = fs.readSync(fd, buffer, 0, CHUNK, position);
      if (!bytes) break;
      position += bytes;
      const pieces = (carry + buffer.toString('utf8', 0, bytes)).split(/\r?\n/);
      carry = pieces.pop() || '';
      for (const line of pieces) {
        if (!line) continue;
        if (firstLine) {
          firstLine = false;
          if (line === MAGIC) continue;
        }
        if (acceptKey({ key: parseKey(line), prefix, seen, keys, limit })) return;
      }
    }
    if (carry && keys.length < limit) {
      if (!(firstLine && carry === MAGIC)) acceptKey({ key: parseKey(carry), prefix, seen, keys, limit });
    }
  } finally {
    fs.closeSync(fd);
  }
}

function listPackedKeys({ $i, shard = 'core', prefix = '', limit = 200 }) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 2000));
  const keys = [];
  const seen = new Set();
  const dbRoot = resolveDbRoot($i);
  for (const file of shardFilesForRead(dbRoot, shard)) {
    scanFileForKeys({ file, prefix, limit: safeLimit, seen, keys });
    if (keys.length >= safeLimit) break;
  }
  return { success: keys, count: keys.length, bounded: true, limit: safeLimit };
}

module.exports = { readPackedKey, listPackedKeys, scanFileForKeys };
