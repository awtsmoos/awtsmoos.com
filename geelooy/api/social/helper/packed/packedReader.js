//B"H
/**
 * @module packedReader
 * @description
 * Read logical keys and direct packed values without replaying the whole shard.
 *
 * Chapter 106: The Awtsmoos folds a five-hundred-megabyte sea into a single
 * measured breath. A route that asks for twenty names may not demand that the
 * server relive every ancient wave. So this vessel drinks by byte, by line, by
 * limit, and then bows out while the world remains alive.
 */

const fs = require('fs');
const { readPacked, resolveDbRoot } = require('./socialPacked.js');
const { shardFilesForRead } = require('./shardPaths.js');

const MAGIC = 'BH_AWTSOCIAL_JSONL_V1';
const CHUNK = 64 * 1024;
const DEFAULT_MAX_BYTES_PER_FILE = 2 * 1024 * 1024;
const DEFAULT_MAX_LINES_PER_FILE = 25000;

function readPackedKey({ $i, shard = 'core', key }) {
  if (!key) return { error: { code: 'MISSING_KEY', message: 'key is required.' } };
  const record = readPacked({ $i, shard, key });
  return record ? { success: record } : { error: { code: 'NOT_FOUND', message: 'Packed key not found.' } };
}

function parseKey(line) {
  try { return JSON.parse(line).key || ''; } catch { return ''; }
}

function safePositive(value, fallback, ceiling) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.max(1, Math.min(Math.floor(number), ceiling));
}

function acceptKey({ key, prefix, seen, keys, limit }) {
  if (!key || seen.has(key)) return false;
  if (prefix && !key.startsWith(prefix)) return false;
  seen.add(key);
  keys.push(key);
  return keys.length >= limit;
}

function consumeLine({ line, firstLine, prefix, seen, keys, limit }) {
  if (!line) return false;
  if (firstLine.value) {
    firstLine.value = false;
    if (line === MAGIC) return false;
  }
  return acceptKey({ key: parseKey(line), prefix, seen, keys, limit });
}

function scanFileForKeys({ file, prefix, limit, seen, keys, maxBytes, maxLines }) {
  const meta = { file, exists: false, bytesRead: 0, linesRead: 0, truncated: false };
  if (!fs.existsSync(file) || keys.length >= limit) return meta;
  meta.exists = true;
  const fd = fs.openSync(file, 'r');
  const buffer = Buffer.alloc(CHUNK);
  let carry = '';
  let position = 0;
  const firstLine = { value: true };
  try {
    while (keys.length < limit && meta.bytesRead < maxBytes && meta.linesRead < maxLines) {
      const remaining = Math.min(CHUNK, maxBytes - meta.bytesRead);
      const bytes = fs.readSync(fd, buffer, 0, remaining, position);
      if (!bytes) break;
      position += bytes;
      meta.bytesRead += bytes;
      const pieces = (carry + buffer.toString('utf8', 0, bytes)).split(/\r?\n/);
      carry = pieces.pop() || '';
      for (const line of pieces) {
        if (meta.linesRead >= maxLines) break;
        meta.linesRead++;
        if (consumeLine({ line, firstLine, prefix, seen, keys, limit })) return meta;
      }
    }
    if (carry && keys.length < limit && meta.bytesRead < maxBytes && meta.linesRead < maxLines) {
      meta.linesRead++;
      consumeLine({ line: carry, firstLine, prefix, seen, keys, limit });
    }
    meta.truncated = keys.length < limit && (meta.bytesRead >= maxBytes || meta.linesRead >= maxLines);
  } finally {
    fs.closeSync(fd);
  }
  return meta;
}

function listPackedKeys({ $i, shard = 'core', prefix = '', limit = 200, maxBytesPerFile, maxLinesPerFile }) {
  const safeLimit = safePositive(limit, 200, 2000);
  const maxBytes = safePositive(maxBytesPerFile, DEFAULT_MAX_BYTES_PER_FILE, 16 * 1024 * 1024);
  const maxLines = safePositive(maxLinesPerFile, DEFAULT_MAX_LINES_PER_FILE, 200000);
  const keys = [];
  const seen = new Set();
  const scanned = [];
  const dbRoot = resolveDbRoot($i);
  for (const file of shardFilesForRead(dbRoot, shard)) {
    scanned.push(scanFileForKeys({ file, prefix, limit: safeLimit, seen, keys, maxBytes, maxLines }));
    if (keys.length >= safeLimit) break;
  }
  return { success: keys, count: keys.length, bounded: true, limit: safeLimit, maxBytesPerFile: maxBytes, maxLinesPerFile: maxLines, scanned };
}

module.exports = { readPackedKey, listPackedKeys, scanFileForKeys };
