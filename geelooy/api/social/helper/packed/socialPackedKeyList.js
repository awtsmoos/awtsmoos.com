//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked latest-wins key listing via index or reverse scan (split from socialPacked.js).
 */
const { engineFor, effectiveRoot, fileFor, firstSeenOf } = require('./socialPackedEngine.js');
const { listIndexed } = require('./keyIndex.js');
const store = require('../awtsmoosDb/shardStore.js');
const { forEachLineReverseAsync } = require('./socialPackedLineReverse.js');
const { fastKeyType } = require('./socialPackedFastKey.js');
/**
 * Latest-wins key listing via reverse scan: the first hit per key scanning
 * backwards is the latest record, so a bounded tail scan yields exact
 * results for the returned keys. Tombstoned keys (latest op 'del') are
 * correctly omitted. O(limit) memory — never loads the shard.
 */
async function listKeysReverseAsync({ $i, shard = 'core', prefix = '', limit = 200 } = {}) {
  const keys = [];
  const seen = new Set();
  if (engineFor($i, shard) !== 'JSONL') {
    // B"H 2026-10-20 (json-migration M0 parity): mirror the JSONL index
    // semantics — tombstoned keys are omitted and results come back
    // newest-first (store records carry their put stamp `updatedAt`).
    try {
      const candidates = [];
      for (const record of store.list({ shard, predicate: r => r.parts?.[0] === 'records' })) {
        const key = record.value?.key;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        if (record.value?.op === 'del') continue;
        if (prefix && !key.startsWith(prefix)) continue;
        candidates.push({ key, firstSeen: firstSeenOf(record) });
      }
      candidates.sort((a, b) => b.firstSeen - a.firstSeen);
      for (const candidate of candidates) {
        keys.push(candidate.key);
        if (keys.length >= limit) break;
      }
    } catch (_) { /* ignore */ }
    return keys;
  }
  const root = effectiveRoot($i, shard);
  // B"H 2026-10-12 (api-hardening): serve listings from the key index —
  // newest-first, latest-wins exact, without scanning the shard.
  try {
    const indexed = await listIndexed(fileFor(root, shard), prefix, limit);
    if (indexed) return indexed;
  } catch (error) {
    if (typeof console !== 'undefined') console.error('B"H packed list index failed, falling back to scan:', (error && error.message) || error);
  }
  await forEachLineReverseAsync(root, shard, (head, getFull) => {
    if (!head) return;
    const fast = fastKeyType(head);
    if (fast) {
      if (seen.has(fast.key)) return;
      seen.add(fast.key);
      if (fast.op === 'del') return;
      if (prefix && !fast.key.startsWith(prefix)) return;
      keys.push(fast.key);
    } else {
      let rec;
      try { rec = JSON.parse(getFull()); } catch (_) { return; }
      const key = rec && rec.key;
      if (!key || seen.has(key)) return;
      seen.add(key);
      if (rec.op === 'del') return;
      if (prefix && !key.startsWith(prefix)) return;
      keys.push(key);
    }
    if (keys.length >= limit) return false;
  });
  return keys;
}
module.exports = { listKeysReverseAsync };
