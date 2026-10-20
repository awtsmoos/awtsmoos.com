//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked core write/read of packed records in JSONL and AwtsmoosDB engines (split from socialPacked.js).
 */
const fs = require('fs');
const path = require('path');
const { engineFor, effectiveRoot, envelope, notePackedWrite, fileFor } = require('./socialPackedEngine.js');
const { noteWrite } = require('./keyIndex.js');
const store = require('../awtsmoosDb/shardStore.js');
const { perfEvent } = require('./perfLog.js');
const { forEachFileRecord } = require('./socialPackedScanSync.js');
const { forEachFileRecordAsync } = require('./socialPackedTail.js');
function writeFileRecord(root, shard, record) {
  const file = fileFor(root, shard);
  if (!file) return null;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // B"H 2026-10-12 (api-hardening): record the byte offset before appending
  // so the key-offset index can serve exact reads without scanning.
  let offset = 0;
  try { offset = fs.statSync(file).size; } catch { offset = 0; }
  fs.appendFileSync(file, JSON.stringify(record) + '\n');
  if (record && record.key) noteWrite(file, offset, record.key);
  return record;
}
function writePacked({ $i, shard = 'core', key, value, op = 'put', meta = {}, type }) {
  const record = envelope({ op, key, value, meta, type });
  notePackedWrite(shard);
  if (engineFor($i, shard) === 'JSONL') return writeFileRecord(effectiveRoot($i, shard), shard, record) || record;
  try {
    const prior = store.get({ shard, parts: ['records', key] })?.value;
    record.fts = prior && typeof prior.fts === 'number' ? prior.fts
      : prior && typeof prior.ts === 'number' ? prior.ts
      : record.ts;
    store.put({ shard, parts: ['records', key], value: record, meta: { ...meta, compat: 'awtsmoosdb-shard' } });
  }
  catch (error) { record.mirrorError = String(error.message || error); }
  return record;
}
function readPacked({ $i, shard = 'core', key }) {
  if (engineFor($i, shard) === 'JSONL') {
    const root = effectiveRoot($i, shard);
    // Append-only JSONL: the LAST record for a key wins — full scan, O(1) memory.
    const scanStart = Date.now();
    let found = null;
    forEachFileRecord(root, shard, (record) => { if (record.key === key) found = record; });
    perfEvent('read-scan', Date.now() - scanStart, { shard });
    return found;
  }
  try { return store.get({ shard, parts: ['records', key] })?.value || null; } catch { return null; }
}
async function readPackedAsync({ $i, shard = 'core', key }) {
  if (engineFor($i, shard) === 'JSONL') {
    const root = effectiveRoot($i, shard);
    let found = null;
    await forEachFileRecordAsync(root, shard, (record) => { if (record.key === key) found = record; });
    return found;
  }
  try { return store.get({ shard, parts: ['records', key] })?.value || null; } catch { return null; }
}
module.exports = { writeFileRecord, writePacked, readPacked, readPackedAsync };
