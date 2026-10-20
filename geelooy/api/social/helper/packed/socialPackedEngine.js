//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked engine routing, file roots, write generations, envelope and first-seen stamp (split from socialPacked.js).
 */
const path = require('path');
const { SHARDS, shardFile } = require('./shardPaths.js');
const { engineOverride } = require('./shardRouting.js');
const { makeEnvelope } = require('./recordEnvelope.js');
const store = require('../awtsmoosDb/shardStore.js');
function fileRoot($i) { return $i?.db?.directory || ''; }
function fileFor(root, shard) { return SHARDS[shard] ? shardFile(root, shard) : ''; }
function resolveDbRoot($i) { return fileRoot($i) || store.info().path; }
/**
 * B"H 2026-10-20 (json-migration M0): per-shard engine routing. The
 * shardRouting override wins when set; otherwise the historical rule
 * applies — a request-local file root means JSONL, anything else means
 * AwtsmoosDB. All overrides ship null (shardRouting.js), so production
 * behavior is unchanged until a shard is flipped at its migration swap.
 */
function engineFor($i, shard = 'core') {
  const override = engineOverride(shard);
  if (override === 'db') return 'AwtsmoosDB';
  if (override === 'file') return 'JSONL';
  return fileRoot($i) ? 'JSONL' : 'AwtsmoosDB';
}
/**
 * The file root a JSONL-routed shard reads/writes under: the request's
 * own root when present, else the shard store's directory (only reached
 * when an override forces JSONL for a rootless caller — a test-only
 * configuration today; production requests always carry a root).
 */
function effectiveRoot($i, shard = 'core') {
  const root = fileRoot($i);
  if (root) return root;
  return engineFor($i, shard) === 'JSONL' ? path.dirname(store.info().path) : '';
}
//B"H 2026-10-20 (M0): per-shard packed-write generation for this process.
//Every writePacked bumps it; AwtsmoosDB-mode consumers that cannot stat
//a shard file (the allPosts grouped cache) validate against it instead.
const writeGenerations = new Map(); // shard -> write count
function notePackedWrite(shard) { writeGenerations.set(shard, (writeGenerations.get(shard) || 0) + 1); }
function shardWriteGeneration(shard = 'core') { return writeGenerations.get(shard) || 0; }
function envelope({ op = 'put', key, value, meta = {}, type }) { return makeEnvelope({ op, key, value, meta, type }); }
/**
 * B"H 2026-10-20 (M0 parity): the JSONL key index orders keys by FIRST
 * append (noteRecord never reorders), so listings are newest-first by
 * first-seen and suffix reads pick the latest first-seen key. The store
 * keeps one record per key and stamps only the last write — so the DB
 * branch preserves a first-seen stamp (`fts`) on the envelope across
 * rewrites, and DB consumers order by it. Falls back to the envelope's
 * own ts, then the store's updatedAt, for records written before fts.
 */
function firstSeenOf(record) {
  const value = record?.value || {};
  if (typeof value.fts === 'number') return value.fts;
  if (typeof value.ts === 'number') return value.ts;
  return record?.updatedAt || 0;
}
module.exports = { fileRoot, fileFor, resolveDbRoot, engineFor, effectiveRoot, notePackedWrite, shardWriteGeneration, envelope, firstSeenOf };
