//B"H
/**
 * @module jsonlShard
 * @description
 * Chapter 21: The shard stopped rereading the entire sea for every pearl.
 *
 * The Awtsmoos renews every byte from ayin every instant, yet the process does
 * not need to parse the whole JSONL ocean three times inside one comment write.
 * This append-only vessel now keeps a per-file latest-record map. Reads still
 * replay truth from disk when the file signature changes; appends update the
 * warm map immediately. Thus the mirror remains honest, but the request is no
 * longer dragged through every historical wave.
 */

const fs = require('fs');
const path = require('path');

const MAGIC = 'BH_AWTSOCIAL_JSONL_V1';
const latestCache = new Map();

function abs(file) {
  return path.resolve(file);
}

function ensureShard(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, `${MAGIC}\n`, 'utf8');
}

function signature(file) {
  try {
    const st = fs.statSync(file);
    return `${st.size}:${st.mtimeMs}`;
  } catch (_) {
    return 'missing';
  }
}

function parseLines(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  if (lines[0] !== MAGIC) throw new Error(`Bad shard magic: ${file}`);
  return lines.slice(1).map(line => JSON.parse(line));
}

function buildLatest(records) {
  const latest = new Map();
  for (const record of records) {
    if (!record.key) continue;
    if (record.op === 'delete') latest.delete(record.key);
    else latest.set(record.key, record);
  }
  return latest;
}

function cachedLatest(file) {
  ensureShard(file);
  const key = abs(file);
  const sig = signature(file);
  const cached = latestCache.get(key);
  if (cached && cached.signature === sig) return cached.latest;
  const latest = buildLatest(parseLines(file));
  latestCache.set(key, { signature: sig, latest });
  return latest;
}

function refreshCachedAppend(file, record) {
  const key = abs(file);
  const cached = latestCache.get(key);
  if (!cached || !record.key) return;
  if (record.op === 'delete') cached.latest.delete(record.key);
  else cached.latest.set(record.key, record);
  cached.signature = signature(file);
}

function appendRecord(file, record) {
  ensureShard(file);
  const stamped = { ...record, ts: record.ts || Date.now() };
  const line = JSON.stringify(stamped);
  fs.appendFileSync(file, line + '\n', 'utf8');
  refreshCachedAppend(file, stamped);
  return { file, bytes: Buffer.byteLength(line) + 1 };
}

function readRecords(file) {
  return parseLines(file);
}

function replayLatest(file) {
  return cachedLatest(file);
}

function getLatest(file, key) {
  return cachedLatest(file).get(key) || null;
}

module.exports = { MAGIC, ensureShard, appendRecord, readRecords, replayLatest, getLatest };
