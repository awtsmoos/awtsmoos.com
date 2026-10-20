//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked list records cache, tail merge and latest point read (split from socialPacked.js).
 */
const fs = require('fs');
const { engineFor, effectiveRoot, fileFor, firstSeenOf } = require('./socialPackedEngine.js');
const store = require('../awtsmoosDb/shardStore.js');
const { perfEvent } = require('./perfLog.js');
const { latestFileRecordsMap } = require('./socialPackedScanSync.js');
const { mergeShardTail, latestFileRecordsAsync } = require('./socialPackedTail.js');
const { readPacked } = require('./socialPackedCore.js');
/**
 * B"H 2026-10-20 (allPosts-list fix): point read of the LATEST envelope
 * for one key, without re-scanning the shard. The AwtsmoosDB branch is a
 * store point read (identical to readPacked). The JSONL branch rides
 * the stat-validated latest-per-key cache that listPackedRecords
 * already maintains: the first call may pay that cache's amortized
 * build (tail-merged on later appends), after which every read is one
 * stat() plus one Map lookup. Returns the envelope or null, exactly
 * like readPacked — tombstone envelopes are returned as stored, so
 * callers keep their own op handling.
 */
function readPackedLatest({ $i, shard = 'core', key }) {
  if (engineFor($i, shard) !== 'JSONL') {
    try { return store.get({ shard, parts: ['records', key] })?.value || null; } catch { return null; }
  }
  const root = effectiveRoot($i, shard);
  const file = fileFor(root, shard);
  if (!file) return null;
  try { fs.statSync(file); } catch { return null; }
  listPackedRecords({ $i, shard }); // ensures the latest-per-key cache is fresh
  const cached = listRecordsCache.get(file);
  if (cached && cached.latest) return cached.latest.get(key) || null;
  perfEvent('latest-fallback', 0, { shard });
  return readPacked({ $i, shard, key }); // cache unavailable: exact scan fallback
}
//B"H 2026-10-19 (series-api-perf): listPackedRecords() re-parsed the ENTIRE
//shard file on every call — 168MB for allPosts, 475MB for search — which made
//GET /api/social/heichelos/ikar/series take 5+ seconds for a 1.3KB response.
//Results are now cached in memory keyed by file identity (dev:ino) + mtimeMs
//+ size, so repeat reads cost a single stat() call ("a tiny bit at a time").
//Any append/rewrite invalidates automatically. A full scan of a shard file
//larger than SCAN_WARN_BYTES always logs a warning (rate-limited) so future
//regressions surface in logs instead of silently slowing endpoints.
//Callers must treat the returned array as read-only.
const SCAN_WARN_BYTES = 1 * 1024 * 1024;
const SCAN_WARN_MIN_INTERVAL_MS = 60 * 1000;
const listRecordsCache = new Map(); // file -> { id, mtimeMs, size, data, latest }
const scanWarnedAt = new Map(); // shard -> timestampMs
function listPackedRecords({ $i, shard = 'core' } = {}) {
  if (engineFor($i, shard) !== 'JSONL') {
    // B"H 2026-10-20 (M0 parity): the JSONL scan yields records in
    // first-append (Map insertion) order; grouped builders reverse()
    // that, so the store branch sorts by the first-seen stamp to match.
    try {
      const records = store.list({ shard, predicate: r => r.parts?.[0] === 'records' })
        .filter(record => record.value?.key);
      records.sort((a, b) => firstSeenOf(a) - firstSeenOf(b));
      const latest = new Map();
      for (const record of records) latest.set(record.value.key, record.value);
      return [...latest.values()];
    } catch { return []; }
  }
  const root = effectiveRoot($i, shard);
  const file = fileFor(root, shard);
  if (!file) return [];
  let st = null;
  try { st = fs.statSync(file); } catch { return []; }
  const id = st.dev + ':' + st.ino;
  const cached = listRecordsCache.get(file);
  if (cached && cached.id === id && cached.mtimeMs === st.mtimeMs && cached.size === st.size) {
    return cached.data;
  }
  // B"H 2026-10-20 (flap-fix): append-only growth (the import case) merges
  // just the new tail bytes into the cached Map. Previously ANY size or
  // mtime change fell through to a full synchronous re-parse of the whole
  // shard - 197MB for allPosts - freezing the event loop for seconds after
  // every import batch and flapping the API. A full rebuild now happens
  // only when the file was replaced or compacted (new inode or shrink).
  if (cached && cached.id === id && cached.latest && st.size > cached.size) {
    try {
      const mergeStart = Date.now();
      const mergedTo = mergeShardTail(cached.latest, file, cached.size, st.size);
      cached.data = [...cached.latest.values()];
      perfEvent('list-merge', Date.now() - mergeStart, { shard, bytes: mergedTo - cached.size, tailBytes: st.size - cached.size });
      cached.mtimeMs = st.mtimeMs;
      cached.size = mergedTo;
      return cached.data;
    } catch { /* tail merge failed: fall through to the full rebuild */ }
  }
  if (st.size > SCAN_WARN_BYTES) {
    const now = Date.now();
    const last = scanWarnedAt.get(shard) || 0;
    if (now - last > SCAN_WARN_MIN_INTERVAL_MS) {
      scanWarnedAt.set(shard, now);
      if (typeof console !== 'undefined') console.warn('B"H packed full-scan: shard=' + shard + ' size=' + (st.size / 1048576).toFixed(1) + 'MB');
    }
  }
  const buildStart = Date.now();
  const latest = latestFileRecordsMap(root, shard);
  const data = [...latest.values()];
  perfEvent('list-build', Date.now() - buildStart, { shard, bytes: st.size });
  listRecordsCache.set(file, { id, mtimeMs: st.mtimeMs, size: st.size, data, latest });
  return data;
}
/** Drops the listPackedRecords cache (tests / graceful shutdown). */
function clearListRecordsCache() { listRecordsCache.clear(); scanWarnedAt.clear(); }
async function listPackedRecordsAsync({ $i, shard = 'core' } = {}) {
  if (engineFor($i, shard) === 'JSONL') return latestFileRecordsAsync(effectiveRoot($i, shard), shard);
  return listPackedRecords({ $i, shard });
}
module.exports = { readPackedLatest, listPackedRecords, clearListRecordsCache, listPackedRecordsAsync };
