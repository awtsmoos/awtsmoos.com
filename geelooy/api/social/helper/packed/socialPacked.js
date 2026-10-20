//B"H
/**
 * @module SocialPackedHybrid
 * @description Chapter 644: packed mirrors now honor the vessel they are given.
 * Test/request-local `$i.db.directory` roots receive JSONL shard files, while
 * production calls without that root continue through native AwtsmoosDB shards.
 */
const fs = require('fs');
const path = require('path');
const { StringDecoder } = require('string_decoder');
const { SHARDS, logicalKey, shardFile, packedRoot } = require('./shardPaths.js');
const { engineOverride } = require('./shardRouting.js');
const { noteWrite, findIndexed, findIndexedBySuffix, listIndexed } = require('./keyIndex.js');
const { RECORD_TYPES, makeEnvelope } = require('./recordEnvelope.js');
const { makeEntityManifest, entityManifestKey } = require('./entityManifest.js');
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
function readLines(file) {
  if (!file || !fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\n+/).filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}
/**
 * B"H 2026-10-11: sync chunked JSONL scan — O(1) memory, no 2 GiB limit.
 * readLines() used fs.readFileSync, which throws ERR_FS_FILE_TOO_LARGE on
 * the production core shard (3.9 GB) — that single throw 500'd every packed
 * read route AND silently emptied buildLiveHashCache (dry-run "wrote" 1011).
 * This scans in 4 MB chunks with a StringDecoder so multi-byte Hebrew is
 * never split mid-character; callers stay synchronous.
 */
function forEachFileRecord(root, shard, onRecord) {
  const file = fileFor(root, shard);
  if (!file || !fs.existsSync(file)) return;
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const CHUNK = 4 * 1024 * 1024;
    const buf = Buffer.allocUnsafe(CHUNK);
    const decoder = new StringDecoder('utf8');
    let leftover = '';
    let pos = 0;
    const handleLine = (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch (_) { return; }
      if (rec && rec.key) onRecord(rec);
    };
    while (pos < size) {
      const n = fs.readSync(fd, buf, 0, Math.min(CHUNK, size - pos), pos);
      if (n <= 0) break;
      pos += n;
      const text = leftover + decoder.write(buf.subarray(0, n));
      const lines = text.split('\n');
      leftover = lines.pop();
      for (const line of lines) handleLine(line);
    }
    handleLine(leftover + decoder.end());
  } finally {
    fs.closeSync(fd);
  }
}
/**
 * Fast forward raw-line scan: chunked reading (no readline overhead) with a
 * setImmediate yield per chunk so the event loop stays responsive on
 * multi-GB shards. Byte-level 0x0A splitting is UTF-8 safe.
 * Lines are located with indexOf (V8's split() on multi-MB strings with
 * 300 KB lines is ~60 MB/s); only each line's head is materialized, since
 * the packed envelope's op/key/recordType always lead the line.
 */
function forEachLineFastAsync(root, shard, onLine) {
  return new Promise((resolve) => {
    const file = fileFor(root, shard);
    if (!file || !fs.existsSync(file)) return resolve();
    const CHUNK = 4 * 1024 * 1024;
    const HEAD = 512;
    let fh = null;
    (async () => {
      try { fh = await fs.promises.open(file, 'r'); }
      catch (_) { return resolve(); }
      const buf = Buffer.allocUnsafe(CHUNK);
      try {
        const size = (await fh.stat()).size;
        let pos = 0;
        let carry = Buffer.alloc(0); // partial-line bytes from previous chunk
        let stopped = false;
        while (pos < size && !stopped) {
          const n = Math.min(CHUNK, size - pos);
          const { bytesRead } = await fh.read(buf, 0, n, pos);
          if (bytesRead <= 0) break;
          pos += bytesRead;
          const chunk = buf.subarray(0, bytesRead);
          let lineStart = 0;
          let carryConsumed = false;
          for (;;) {
            const nl = chunk.indexOf(0x0A, lineStart);
            if (nl < 0) break;
            let head, getFull;
            if (carry.length && !carryConsumed) {
              // Line spans the chunk boundary: head = first 512 bytes of carry+segment.
              const need = Math.max(0, HEAD - carry.length);
              head = (need > 0
                ? Buffer.concat([carry, chunk.subarray(0, Math.min(nl, need))])
                : carry.subarray(0, HEAD)).toString('utf8');
              const c0 = carry, s1 = lineStart, e1 = nl;
              getFull = () => Buffer.concat([c0, chunk.subarray(s1, e1)]).toString('utf8');
              carryConsumed = true;
            } else {
              head = chunk.subarray(lineStart, Math.min(nl, lineStart + HEAD)).toString('utf8');
              const s1 = lineStart, e1 = nl;
              getFull = () => chunk.subarray(s1, e1).toString('utf8');
            }
            if (onLine(head, getFull) === false) { stopped = true; break; }
            lineStart = nl + 1;
          }
          // chunk is a reused view — copy the tail.
          carry = lineStart < chunk.length ? Buffer.from(chunk.subarray(lineStart)) : Buffer.alloc(0);
          await new Promise(r => setImmediate(r));
        }
        if (!stopped && carry.length) {
          const tail = carry.toString('utf8');
          onLine(tail.slice(0, HEAD), () => tail);
        }
      } finally {
        try { await fh.close(); } catch (_) {}
        resolve();
      }
    })();
  });
}
function forEachLineReverseAsync(root, shard, onLine, maxBytes = Infinity) {
  return new Promise((resolve) => {
    const file = fileFor(root, shard);
    if (!file || !fs.existsSync(file)) return resolve();
    const CHUNK = 4 * 1024 * 1024;
    const HEAD = 512;
    let fh = null;
    (async () => {
      try { fh = await fs.promises.open(file, 'r'); }
      catch (_) { return resolve(); }
      try {
        const size = (await fh.stat()).size;
        let pos = size;
        let scanned = 0;
        let pending = Buffer.alloc(0);
        let stopped = false;
        const buf = Buffer.allocUnsafe(CHUNK);
        while (pos > 0 && scanned < maxBytes && !stopped) {
          const n = Math.min(CHUNK, pos, maxBytes - scanned);
          const start = pos - n;
          const { bytesRead } = await fh.read(buf, 0, n, start);
          if (bytesRead <= 0) break;
          pos = start; scanned += bytesRead;
          const combined = pending.length ? Buffer.concat([buf.subarray(0, bytesRead), pending]) : buf.subarray(0, bytesRead);
          // Native reverse search (memrchr) — a JS byte loop over 4 MB is ~10x slower.
          const spans = [];
          let cur = combined.length;
          for (;;) {
            const nl = combined.lastIndexOf(0x0A, cur - 1);
            if (nl < 0) break;
            spans.push([nl + 1, cur]);
            cur = nl;
            if (cur <= 0) break;
          }
          pending = combined.subarray(0, cur);
          for (const [a, b] of spans) {
            if (b <= a) continue;
            // Head slice + lazy full materialization (full 300 KB lines as
            // strings would make a whole-file scan crawl).
            const head = combined.subarray(a, Math.min(b, a + HEAD)).toString('utf8');
            const getFull = () => combined.subarray(a, b).toString('utf8');
            if (onLine(head, getFull) === false) { stopped = true; break; }
          }
          await new Promise(r => setImmediate(r));
        }
        if (!stopped && pending.length) {
          const tail = pending.toString('utf8');
          onLine(tail.slice(0, HEAD), () => tail);
        }
      } finally {
        try { await fh.close(); } catch (_) {}
        resolve();
      }
    })();
  });
}
/**
 * Fast {key, op, recordType} extraction without JSON.parse — the stats scan
 * touches every line of multi-GB shards, and full parsing is ~90 MB/s
 * (3.9 GB ≈ 43 s, past nginx's timeout). Targeted string extraction runs
 * at ~500 MB/s+. Falls back to null (caller then JSON.parses the line).
 * Field order follows makeEnvelope(): op, key, recordType, value, ...
 */
function fastKeyType(line) {
  try {
    const vi = line.indexOf('"value":');
    let ki = line.indexOf('"key":"');
    if (ki < 0 || (vi >= 0 && ki > vi)) return null;
    ki += 7;
    let ke = ki;
    while (ke < line.length) {
      const c = line[ke];
      if (c === '\\') { ke += 2; continue; }
      if (c === '"') break;
      ke++;
    }
    if (ke >= line.length) return null;
    const key = line.slice(ki, ke);
    if (!key) return null;
    let op = 'put';
    const oi = line.indexOf('"op":"');
    if (oi >= 0 && oi < ki) {
      const oe = line.indexOf('"', oi + 6);
      if (oe > oi + 6) op = line.slice(oi + 6, oe);
    }
    let type = 'unknown';
    const ti = line.indexOf('"recordType":"');
    if (ti >= 0 && ti < ki + 200) {
      const te = line.indexOf('"', ti + 14);
      if (te > ti + 14) type = line.slice(ti + 14, te);
    }
    return { key, op, type };
  } catch (_) { return null; }
}
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
function latestFileRecords(root, shard) {
  const latest = new Map();
  forEachFileRecord(root, shard, (record) => latest.set(record.key, record));
  return [...latest.values()];
}
/**
 * B"H 2026-10-20 (flap-fix): builds the latest-per-key Map directly so the
 * records cache can retain it and merge appends incrementally (see
 * listPackedRecords) instead of re-parsing the whole shard per change.
 */
function latestFileRecordsMap(root, shard) {
  const latest = new Map();
  forEachFileRecord(root, shard, (record) => latest.set(record.key, record));
  return latest;
}
/**
 * B"H 2026-10-20 (flap-fix): merges ONLY the appended tail bytes [from, to)
 * of an append-only JSONL shard into an existing latest-per-key Map.
 * Splitting on the raw 0x0A byte is UTF-8 safe (0x0A never appears inside
 * a multi-byte sequence). Returns the offset just past the last complete
 * newline merged, so a partial line caught mid-append is re-read on the
 * next merge instead of being consumed half-parsed.
 */
function mergeShardTail(latest, file, from, to) {
  const fd = fs.openSync(file, 'r');
  try {
    const CHUNK = 4 * 1024 * 1024;
    let pos = from;
    let pending = Buffer.alloc(0);
    while (pos < to) {
      const want = Math.min(CHUNK, to - pos);
      const buf = Buffer.allocUnsafe(want);
      const n = fs.readSync(fd, buf, 0, want, pos);
      if (n <= 0) break;
      pos += n;
      pending = pending.length ? Buffer.concat([pending, buf.subarray(0, n)]) : buf.subarray(0, n);
      const cut = pending.lastIndexOf(0x0a);
      if (cut < 0) continue;
      const complete = pending.subarray(0, cut + 1).toString('utf8');
      pending = pending.subarray(cut + 1);
      for (const line of complete.split('\n')) {
        if (!line) continue;
        let rec;
        try { rec = JSON.parse(line); } catch { continue; }
        if (rec && rec.key) latest.set(rec.key, rec);
      }
    }
    return pos - pending.length;
  } finally {
    fs.closeSync(fd);
  }
}
async function latestFileRecordsAsync(root, shard) {
  const latest = new Map();
  await forEachFileRecordAsync(root, shard, (record) => latest.set(record.key, record));
  return [...latest.values()];
}
/**
 * Async forward scan that never accumulates: the callback decides what to
 * retain. (latestFileRecordsAsync above retains everything — do NOT use it
 * on multi-GB shards; it OOMs. It is kept only for small-shard callers.)
 */
function forEachFileRecordAsync(root, shard, onRecord) {
  return new Promise((resolve) => {
    const file = fileFor(root, shard);
    if (!file || !fs.existsSync(file)) return resolve();
    const rl = require('readline').createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch (_) { return; }
      if (rec && rec.key) {
        try { onRecord(rec); } catch (_) { /* ignore */ }
      }
    });
    rl.on('close', () => resolve());
    rl.on('error', () => resolve());
  });
}
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
    let found = null;
    forEachFileRecord(root, shard, (record) => { if (record.key === key) found = record; });
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
      const mergedTo = mergeShardTail(cached.latest, file, cached.size, st.size);
      cached.data = [...cached.latest.values()];
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
  const latest = latestFileRecordsMap(root, shard);
  const data = [...latest.values()];
  listRecordsCache.set(file, { id, mtimeMs: st.mtimeMs, size: st.size, data, latest });
  return data;
}
/** Drops the listPackedRecords cache (tests / graceful shutdown). */
function clearListRecordsCache() { listRecordsCache.clear(); scanWarnedAt.clear(); }
async function listPackedRecordsAsync({ $i, shard = 'core' } = {}) {
  if (engineFor($i, shard) === 'JSONL') return latestFileRecordsAsync(effectiveRoot($i, shard), shard);
  return listPackedRecords({ $i, shard });
}
function writeManifest({ $i, manifest }) { return writePacked({ $i, shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: manifest.kind } }); }
function writeIndex({ $i, key, value, meta }) { return writePacked({ $i, shard: 'search', key, value, meta: { kind: 'materializedIndex', ...meta } }); }
function appendEvent({ $i, type, actor = '', entity = {}, data = {} }) {
  const event = { id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`, type, actor, entity, data, createdAt: Date.now() };
  return writePacked({ $i, shard: 'audit', key: logicalKey(['events', type, event.id]), value: event, meta: { kind: 'socialEvent', type } });
}
/**
 * B"H 2026-10-13 (social-feed-audit): smart excerpt extraction.
 * Imported posts (maamarim, encyclopedia, translations) store their text in
 * `units[]` (bilingual hebrew/english), not in a flat `content` field — so the
 * old `post.content || post.description` logic produced empty excerpts for
 * every imported post. This scans direct fields first, then units (English
 * preferred, Hebrew fallback), then sections. Markdown artifacts stripped.
 */
function excerptOf(post) {
  if (!post || typeof post !== 'object') return '';
  const clean = (t) => String(t || '')
    .replace(/[#*`_>\[\](){}|~\\]/g, ' ')
    .replace(/https?:\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const direct = post.content || post.description || post.summary || post.body || post.text || '';
  if (direct && clean(direct).length > 20) return clean(direct).slice(0, 280);
  const units = Array.isArray(post.units) ? post.units : [];
  for (const u of units) {
    if (!u || typeof u !== 'object') continue;
    const t = clean(u.english || u.text || u.content || '');
    if (t.length > 40) return t.slice(0, 280);
  }
  for (const u of units) {
    if (!u || typeof u !== 'object') continue;
    const t = clean(u.hebrew || '');
    if (t.length > 40) return t.slice(0, 280);
  }
  const secs = Array.isArray(post.sections) ? post.sections : [];
  for (const s of secs) {
    const t = clean((s && (s.text || s.content || s.body)) || '');
    if (t.length > 40) return t.slice(0, 280);
  }
  return '';
}
function allPostValue(post) {
  const postId = post.id || post.postId;
  return { postId, heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || 'root', aliasId: post.aliasId || post.author || '', authorName: post.authorName || '', authorHandle: post.authorHandle || '', type: post.contentType || post.postType || 'post', title: post.title || post.name || '', excerpt: excerptOf(post), connected: true, basePostId: post.basePostId || post.base_post_id || '', parentPostId: post.parentPostId || post.parent_post_id || '', kind: post.kind || '', updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now() };
}
function mirrorAllPost({ $i, post }) {
  const value = allPostValue(post);
  return writePacked({ $i, shard: 'allPosts', key: logicalKey(['allPosts', value.heichelId, value.postId]), value, meta: { kind: 'allPost', aliasId: value.aliasId, heichelId: value.heichelId, seriesId: value.seriesId } });
}
function indexPost({ $i, value }) {
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByHeichel', value.heichelId, value.postId]), value, meta: { index: 'postsByHeichel' } });
  if (value.aliasId) writeIndex({ $i, key: logicalKey(['indexes', 'postsByAlias', value.aliasId, value.postId]), value, meta: { index: 'postsByAlias' } });
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByType', value.type, value.postId]), value, meta: { index: 'postsByType' } });
  if (value.parentPostId) writeIndex({ $i, key: logicalKey(['indexes', 'postsByParent', value.parentPostId, value.postId]), value, meta: { index: 'postsByParent' } });
}
function mirrorPost({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const coreKey = logicalKey(['posts', post.heichelId, postId]);
  const write = writePacked({ $i, shard: 'core', key: coreKey, value: post, meta: { kind: 'post', type: contentType } });
  const allPost = mirrorAllPost({ $i, post }).value;
  writeManifest({ $i, manifest: makeEntityManifest({ kind: 'post', id: postId, paths: { core: coreKey, allPosts: logicalKey(['allPosts', post.heichelId, postId]) }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]) }, binaryRefs: { engine: engineFor($i, 'core') }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } }) });
  indexPost({ $i, value: allPost });
  appendEvent({ $i, type: 'post.mirrored', actor: allPost.aliasId, entity: { kind: 'post', id: postId }, data: { heichelId: post.heichelId, contentType } });
  return write;
}
/**
 * Bulk-optimized post writer for the import job (Yaakov 2026-10-11:
 * bulk importer is #1 priority — reliable, reusable, fast).
 * Same records as mirrorPost (core, allPosts mirror, entity manifest,
 * search indexes) but WITHOUT the per-post audit event — the import job's
 * own job log (post-import-jobs.log) is the audit trail for bulk runs.
 * Callers yield to the event loop between posts; the JSONL appends here
 * are individually fast.
 */
/**
 * B"H 2026-10-11 (import-speed): the exact shard records mirrorPostBulk
 * writes for one post, as pure data (no I/O). This is the single
 * construction site for both the single-post and the batched mirror
 * writers, so the bytes can never drift between the two paths.
 * Each entry: { shard, key, value, meta } — the writePacked arguments.
 */
function mirrorPostRecords({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const coreKey = logicalKey(['posts', post.heichelId, postId]);
  const allPost = allPostValue(post);
  const manifest = makeEntityManifest({ kind: 'post', id: postId, paths: { core: coreKey, allPosts: logicalKey(['allPosts', post.heichelId, postId]) }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]) }, binaryRefs: { engine: engineFor($i, 'core') }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } });
  const records = [
    { shard: 'core', key: coreKey, value: post, meta: { kind: 'post', type: contentType } },
    { shard: 'allPosts', key: logicalKey(['allPosts', allPost.heichelId, postId]), value: allPost, meta: { kind: 'allPost', aliasId: allPost.aliasId, heichelId: allPost.heichelId, seriesId: allPost.seriesId } },
    { shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: manifest.kind } },
    { shard: 'search', key: logicalKey(['indexes', 'postsByHeichel', allPost.heichelId, postId]), value: allPost, meta: { kind: 'materializedIndex', index: 'postsByHeichel' } },
  ];
  if (allPost.aliasId) {
    records.push({ shard: 'search', key: logicalKey(['indexes', 'postsByAlias', allPost.aliasId, postId]), value: allPost, meta: { kind: 'materializedIndex', index: 'postsByAlias' } });
  }
  records.push({ shard: 'search', key: logicalKey(['indexes', 'postsByType', allPost.type, postId]), value: allPost, meta: { kind: 'materializedIndex', index: 'postsByType' } });
  return records;
}
function mirrorPostBulk({ $i, post }) {
  let first = null;
  const touchedFiles = new Set();
  for (const r of mirrorPostRecords({ $i, post })) {
    const w = writePacked({ $i, shard: r.shard, key: r.key, value: r.value, meta: r.meta });
    if (!first) first = w;
    // BH 2026-10-19: track touched shards for cache invalidation
    try {
      const root = fileRoot($i);
      if (root) {
        const f = fileFor(root, r.shard);
        if (f) touchedFiles.add(f);
      }
    } catch (_) {}
  }
  // B"H 2026-10-20 (flap-fix): the read cache is NO LONGER deleted here.
  // listPackedRecords validates by stat (dev:ino + mtimeMs + size) on
  // every call and tail-merges appends, so written records stay visible
  // immediately WITHOUT forcing the next reader into a full shard
  // re-parse. Deleting the entry per write was the flap trigger.
  // BH 2026-10-19: also clear the grouped posts cache (allPostsIndex.js)
  try {
    const allPostsIndex = require("./allPostsIndex.js");
    if (allPostsIndex.clearGroupedCache) allPostsIndex.clearGroupedCache();
  } catch (_) {}
  // BH 2026-10-19: do NOT delete grouped.json - mergeTailRecords handles append-only growth efficiently
  return first;
}
/**
 * B"H 2026-10-11 (import-speed): batched packed-mirror write. Builds the
 * exact envelopes mirrorPostBulk would write and appends ONE chunk per
 * shard file — 4 appends per batch instead of 6 per post. File bytes are
 * identical to the per-post path (same JSONL lines, same per-shard order);
 * the append-only "last record wins" read contract is unchanged. Falls
 * back to per-post writes when there is no file root (native-shard mode).
 */
function mirrorPostsBulk({ $i, posts }) {
  const list = Array.isArray(posts) ? posts : [];
  const root = fileRoot($i);
  if (!root) {
    for (const post of list) mirrorPostBulk({ $i, post });
    return list.length;
  }
  const byShard = new Map();
  const dbRecords = [];
  for (const post of list) {
    for (const r of mirrorPostRecords({ $i, post })) {
      // B"H 2026-10-20 (json-migration M0): a shard flipped to AwtsmoosDB
      // bypasses the batched file append and writes through writePacked,
      // so a mixed-engine batch can never land DB records in a JSONL file.
      if (engineFor($i, r.shard) !== 'JSONL') { dbRecords.push(r); continue; }
      let lines = byShard.get(r.shard);
      if (!lines) { lines = []; byShard.set(r.shard, lines); }
      lines.push(JSON.stringify(envelope({ op: 'put', key: r.key, value: r.value, meta: r.meta })) + '\n');
    }
  }
  for (const [shard, lines] of byShard) {
    const file = fileFor(root, shard);
    if (!file) continue;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, lines.join(''));
  }
  for (const r of dbRecords) writePacked({ $i, shard: r.shard, key: r.key, value: r.value, meta: r.meta });
  // B"H 2026-10-20 (flap-fix): read caches are NOT deleted here either -
  // stat validation + tail merge in listPackedRecords keeps reads fresh
  // without a full re-parse after every batched write (see mirrorPostBulk).
  try {
    const allPostsIndex = require('./allPostsIndex.js');
    if (allPostsIndex.clearGroupedCache) allPostsIndex.clearGroupedCache();
  } catch (_) {}
  return list.length;
}
function indexGraph({ $i, reference }) {
  const value = { id: reference.id, kind: reference.kind, from: reference.from, to: reference.to, updatedAt: Date.now() };
  writeIndex({ $i, key: logicalKey(['indexes', 'graphOut', reference.from?.type, reference.from?.id, reference.id]), value, meta: { index: 'graphOut', edgeKind: reference.kind } });
  writeIndex({ $i, key: logicalKey(['indexes', 'graphIn', reference.to?.type, reference.to?.id, reference.id]), value, meta: { index: 'graphIn', edgeKind: reference.kind } });
}
function mirrorGraphReference({ $i, reference }) {
  const write = writePacked({ $i, shard: 'graph', key: logicalKey(['graph', reference.kind, reference.id]), value: reference, type: RECORD_TYPES.graphEdge, meta: { kind: 'graph', edgeKind: reference.kind } });
  indexGraph({ $i, reference });
  appendEvent({ $i, type: 'graph.edge.mirrored', actor: reference.aliasId || '', entity: { kind: 'graphEdge', id: reference.id }, data: { edgeKind: reference.kind } });
  return write;
}
function mirrorNotification({ $i, notification }) {
  const write = writePacked({ $i, shard: 'notify', key: logicalKey(['notifications', notification.toAliasId, notification.id]), value: notification, type: RECORD_TYPES.notification, meta: { kind: 'notification', type: notification.type } });
  appendEvent({ $i, type: 'notification.mirrored', actor: notification.fromAliasId || '', entity: { kind: 'notification', id: notification.id }, data: { toAliasId: notification.toAliasId, type: notification.type } });
  return write;
}
function shardFileStats({ $i, shard }) {
  const engine = engineFor($i, shard);
  const file = engine === 'JSONL' ? fileFor(effectiveRoot($i, shard), shard) : resolveDbRoot($i);
  const exists = Boolean(file && fs.existsSync(file));
  const stat = exists ? fs.statSync(file) : null;
  return { files: [{ file, exists, bytes: stat?.size || 0, mtimeMs: stat?.mtimeMs || 0, engine, shard }], bytes: stat?.size || 0 };
}
function shardStats({ $i, shard = 'core' }) {
  const records = listPackedRecords({ $i, shard });
  const byType = {};
  for (const r of records) byType[r.recordType || r.meta?.kind || 'unknown'] = (byType[r.recordType || r.meta?.kind || 'unknown'] || 0) + 1;
  return { shard, records: records.length, logicalKeys: new Set(records.map(r => r.key).filter(Boolean)).size, byType, approximate: false, engine: engineFor($i, shard), bytes: shardFileStats({ $i, shard }).bytes, files: shardFileStats({ $i, shard }).files };
}
function allShardStats({ $i } = {}) { return ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search', 'feed'].map(shard => shardStats({ $i, shard })); }
async function shardStatsAsync({ $i, shard = 'core' }) {
  // B"H 2026-10-11: exact aggregates WITHOUT retaining records — the core
  // shard is 3.9 GB and holding parsed values OOMs the server. We retain
  // only key -> type (~2 MB for 21k keys) and extract key/type/op without
  // JSON.parse (fast path; JSON.parse fallback per line when needed).
  const types = new Map();
  const recordOne = (key, type, op) => {
    if (!key) return;
    if (op === 'del') { types.delete(key); return; }
    types.set(key, type || 'unknown');
  };
  if (engineFor($i, shard) === 'JSONL') {
    const root = effectiveRoot($i, shard);
    // Forward raw-line scan with fast key/type extraction (no JSON.parse):
    // chunked ~4 MB reads with event-loop yields — the 3.9 GB core shard
    // finishes inside nginx's timeout instead of 504ing.
    await forEachLineFastAsync(root, shard, (head, getFull) => {
      const fast = fastKeyType(head);
      if (fast) { recordOne(fast.key, fast.type, fast.op); return; }
      try {
        const rec = JSON.parse(getFull());
        if (rec && rec.key) recordOne(rec.key, rec.recordType || (rec.meta && rec.meta.kind), rec.op);
      } catch (_) { /* skip corrupt line */ }
    });
  } else {
    try {
      for (const record of store.list({ shard, predicate: r => r.parts?.[0] === 'records' })) {
        const v = record.value || {};
        recordOne(v.key, v.recordType || (v.meta && v.meta.kind), v.op);
      }
    } catch (_) { /* ignore */ }
  }
  const byType = {};
  for (const t of types.values()) byType[t] = (byType[t] || 0) + 1;
  return { shard, records: types.size, logicalKeys: types.size, byType, approximate: false, engine: engineFor($i, shard), bytes: shardFileStats({ $i, shard }).bytes, files: shardFileStats({ $i, shard }).files };
}
async function allShardStatsAsync({ $i } = {}) {
  const out = [];
  for (const shard of ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search', 'feed']) out.push(await shardStatsAsync({ $i, shard }));
  return out;
}
function writeMigrationManifest({ $i, manifest }) { return writePacked({ $i, shard: 'meta', key: logicalKey(['migrations', manifest.id]), value: manifest, type: RECORD_TYPES.migrationManifest, meta: { kind: 'migrationManifest', migrationType: manifest.type } }); }
// B"H — children lookup for premade social threads (kind=comment/reply with parentPostId).
// Uses the postsByParent materialized index: /indexes/postsByParent/<parentId>/<postId>
async function getPostsByParent({ $i, parentPostId, limit = 200 } = {}) {
  if (!parentPostId) return [];
  const prefix = logicalKey(['indexes', 'postsByParent', String(parentPostId)]) + '/';
  const keys = await listKeysReverseAsync({ $i, shard: 'search', prefix, limit });
  const out = [];
  for (const key of keys) {
    try {
      const rec = await readPackedAsync({ $i, shard: 'search', key });
      const v = rec && (rec.value || rec);
      if (v && v.postId) out.push(v);
    } catch (_) { /* skip unreadable */ }
  }
  return out;
}
module.exports = { resolveDbRoot, fileRoot, engineFor, effectiveRoot, shardWriteGeneration, writePacked, readPacked, readPackedAsync, readPackedLatest, listPackedRecords, clearListRecordsCache, forEachFileRecord, forEachFileRecordAsync, forEachLineFastAsync, forEachLineReverseAsync, listKeysReverseAsync, findKeyReverseAsync, findKeySuffixReverseAsync, fastKeyType, writeManifest, writeIndex, appendEvent, mirrorPost, mirrorPostBulk, mirrorPostsBulk, mirrorPostRecords, mirrorAllPost, mirrorGraphReference, mirrorNotification, writeMigrationManifest, shardStats, shardStatsAsync, allShardStats, allShardStatsAsync, shardFileStats, excerptOf, allPostValue, getPostsByParent };
