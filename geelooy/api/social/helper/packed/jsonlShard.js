//B"H
/**
 * @module jsonlShard
 * @description
 * Append-only packed sidecar shard. It stores logical social DB paths inside
 * a single physical file per shard while keeping replay and repair simple.
 */

const fs = require('fs');
const path = require('path');

const MAGIC = 'BH_AWTSOCIAL_JSONL_V1';

function ensureShard(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, `${MAGIC}\n`, 'utf8');
}

function appendRecord(file, record) {
  ensureShard(file);
  const line = JSON.stringify({ ...record, ts: record.ts || Date.now() });
  fs.appendFileSync(file, line + '\n', 'utf8');
  return { file, bytes: Buffer.byteLength(line) + 1 };
}

function readRecords(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  if (lines[0] !== MAGIC) throw new Error(`Bad shard magic: ${file}`);
  return lines.slice(1).map(line => JSON.parse(line));
}

function replayLatest(file) {
  const latest = new Map();
  for (const record of readRecords(file)) {
    if (!record.key) continue;
    if (record.op === 'delete') latest.delete(record.key);
    else latest.set(record.key, record);
  }
  return latest;
}

function getLatest(file, key) {
  return replayLatest(file).get(key) || null;
}

module.exports = { MAGIC, ensureShard, appendRecord, readRecords, replayLatest, getLatest };
