//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked single-key and suffix key reads via the key index (split from socialPacked.js).
 */
const { engineFor, effectiveRoot, fileFor, firstSeenOf } = require('./socialPackedEngine.js');
const { findIndexed, findIndexedBySuffix } = require('./keyIndex.js');
const store = require('../awtsmoosDb/shardStore.js');
/** Single-key read via the key-offset index (exact, no full scan). */
async function findKeyReverseAsync({ $i, shard = 'core', key }) {
  if (engineFor($i, shard) !== 'JSONL') {
    try {
      const value = store.get({ shard, parts: ['records', key] })?.value || null;
      // B"H 2026-10-20 (M0 parity): the JSONL index honors tombstones —
      // a latest record with op 'del' reads as not-found (keyIndex.js).
      return value && value.op !== 'del' ? value : null;
    } catch { return null; }
  }
  const root = effectiveRoot($i, shard);
  // B"H 2026-10-12 (api-hardening): the index answers hits AND misses
  // exactly — a missing key no longer reverse-scans multi-GB shards.
  try {
    return await findIndexed(fileFor(root, shard), key);
  } catch (error) {
    if (typeof console !== 'undefined') console.error('B"H packed key index read failed, failing closed:', (error && error.message) || error);
    return null;
  }
}
/**
 * B"H 2026-10-12 (FRONT-1 api-audit): postId fallback for /packed/read.
 * Callers pass a bare postId (e.g. ?key=BH_RAMBAM_...); stored keys are
 * logical (/posts/<heichel>/<postId>). Newest-first scan for the first key
 * whose final segment equals postId, with per-key latest-wins tombstone
 * semantics (a tombstoned key is skipped, older same-suffix keys still win).
 */
async function findKeySuffixReverseAsync({ $i, shard = 'core', postId }) {
  if (!postId || postId.includes('/')) return null;
  if (engineFor($i, shard) !== 'JSONL') {
    // B"H 2026-10-20 (json-migration M0): the AwtsmoosDB branch had NO
    // suffix lookup at all — it returned null unconditionally, so every
    // bare-postId read missed on this engine. Mirror the key index
    // exactly: among keys whose final segment equals postId, the newest
    // record wins and a tombstoned newest falls through to older
    // same-suffix keys. The store keeps one record per key, stamped
    // with the envelope's preserved first-seen stamp supplying the
    // index's first-append ordering (see firstSeenOf).
    try {
      const candidates = [];
      for (const record of store.list({ shard, predicate: r => r.parts?.[0] === 'records' })) {
        const value = record.value;
        if (!value?.key || !value.key.endsWith('/' + postId)) continue;
        candidates.push(record);
      }
      candidates.sort((a, b) => firstSeenOf(b) - firstSeenOf(a));
      for (const record of candidates) {
        if (record.value.op !== 'del') return record.value;
      }
      return null;
    } catch { return null; }
  }
  const root = effectiveRoot($i, shard);
  if (!root) return null;
  // B"H 2026-10-12 (api-hardening): suffix reads ride the same key index —
  // a missing postId no longer scans the shard to prove its absence.
  try {
    return await findIndexedBySuffix(fileFor(root, shard), postId);
  } catch (error) {
    if (typeof console !== 'undefined') console.error('B"H packed suffix index read failed, failing closed:', (error && error.message) || error);
    return null;
  }
}
module.exports = { findKeyReverseAsync, findKeySuffixReverseAsync };
