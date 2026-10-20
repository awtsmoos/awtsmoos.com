//B"H
/**
 * @module AllPostsIndex
 * @description Chapter 645: all-post index operations now pass through the
 * same hybrid packed writer as posts, migrations, and tests. A local `$i` root
 * receives JSONL shards; production without `$i.db.directory` uses AwtsmoosDB.
 */
const fs = require('fs');
const { logicalKey, shardFile, SHARDS } = require('./shardPaths.js');
const { writePacked, readPackedLatest, listPackedRecords, excerptOf, effectiveRoot, shardWriteGeneration } = require('./socialPacked.js');
/**
 * B"H 2026-10-20 (safeguards): full-scan incident counter. A whole-shard
 * scan on the request path is an INCIDENT by definition — every run is
 * journaled and counted for the pulse endpoint. Never removed quietly.
 */
const { noteFullScan } = require('../safeguards/fullscanWatch.js');
const { perfEvent } = require('./perfLog.js');

function allPostKey({ heichelId, postId }) { return logicalKey(['allPosts', heichelId, postId]); }
function postIdOf(post) { return post?.postId || post?.id || ''; }
function compactPost(post) {
  return { postId: postIdOf(post), heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || 'root', aliasId: post.aliasId || post.author || '', type: post.contentType || post.postType || 'post', title: post.title || post.name || '', excerpt: excerptOf(post), connected: true, migratedAt: post.migratedAt || Date.now(), updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now() };
}
function fullAllPost(post) {
  const postId = postIdOf(post);
  const seriesId = post.seriesId || post.parentSeriesId || 'root';
  return { ...post, id: post.id || postId, postId, heichelId: post.heichelId || '', seriesId, parentSeriesId: post.parentSeriesId || seriesId, connected: true, migratedAt: post.migratedAt || Date.now(), _awtsmoosStorage: 'social.allPosts.awtsdb' };
}
function writeAllPost({ $i, post }) {
  const value = fullAllPost(post);
  return writePacked({ $i, shard: 'allPosts', key: allPostKey({ heichelId: value.heichelId, postId: value.postId }), value, meta: { kind: 'post', storage: 'allPosts', heichelId: value.heichelId, seriesId: value.seriesId, aliasId: value.aliasId || value.author || '' } });
}
function readAllPost({ $i, heichelId, postId }) {
  // B"H 2026-10-20 (allPosts-list fix): latest-envelope point read via
  // the facade's stat-validated latest-per-key cache (readPackedLatest)
  // instead of readPacked's per-call full shard scan.
  return readPackedLatest({ $i, shard: 'allPosts', key: allPostKey({ heichelId, postId }) });
}
/**
 * B"H 2026-10-12 (api-hardening): single-scan partition of packed posts by
 * series. Series browse pages list children summaries (up to dozens); calling
 * allPosts() per child would re-scan the whole allPosts shard per child.
 * This scans once and groups compact posts by every series identity they
 * claim (seriesId and parentSeriesId), so one pass serves the whole page.
 * Tombstoned (op:'del') records are skipped — a deleted post must not haunt
 * a series listing.
 * @returns {Map<string, Array<object>>} seriesId -> compact posts (newest first)
 */
//B"H 2026-10-19 (series-api-perf): the grouped compact-post map is cached in
//memory AND persisted to disk (<shard>.grouped.json), so series listing pages
//cost one stat() call on repeat reads — even across service restarts. Both
//layers validate the shard file's mtimeMs+size, so any append/rewrite
//invalidates automatically. This is the permanent fix for the 5s series-list.
const groupedCache = new Map();
/**
 * B"H 2026-10-20 (safeguards phase 2 - cache discipline): bulk-write
 * hook called by the mirror writers after every post and batch. This
 * used to WIPE the whole grouped map (groupedCache.clear()), so the
 * next series read missed memory, missed the persisted snapshot
 * (stale watermark) and fell into a full ~200 MB shard rebuild -
 * one of the two flap triggers. The map is now KEPT on purpose:
 * every entry self-validates against the shard stat (mtimeMs+size)
 * on read, append-only growth is tail-merged in place, and only a
 * replaced/compacted shard pays one rebuild (journaled as a
 * full-scan incident). Surgical invalidation beats deletion.
 * @returns {number} Grouped entries retained (never dropped here).
 */
let groupedWriteBursts = 0;
function clearGroupedCache() { groupedWriteBursts++; return groupedCache.size; }
// B"H 2026-10-20 (allPosts-list fix): snapshot format v2 — persists the
// heichel-ordered `all` list alongside the series groups so the alias
// dimension and ordered list survive restarts without a rebuild. v1
// snapshots fail the version check below and are rebuilt once, exactly
// like any other stale snapshot.
const GROUPED_CACHE_VERSION = 2;
function allPostsShardFile($i) {
  try {
    // B"H 2026-10-20 (json-migration M0): the root follows facade routing —
    // empty whenever allPosts is AwtsmoosDB-routed, so getFullGrouping
    // takes its generation-validated in-memory path instead of stat-ing
    // a JSONL file that no longer receives the writes.
    const root = effectiveRoot($i, 'allPosts');
    if (!root || !SHARDS || !SHARDS['allPosts']) return '';
    return shardFile(root, 'allPosts') || '';
  } catch { return ''; }
}
function groupedCacheFile(file) { return file + '.grouped.json'; }
/**
 * B"H 2026-10-20 (flap-fix): loads the persisted grouped snapshot WITHOUT
 * demanding an exact mtime/size match, returning its saved watermark so
 * getFullGrouping can tail-merge a stale snapshot forward when the shard
 * only grew. Returns null when no usable snapshot exists.
 */
function loadGroupedSnapshot(file) {
  try {
    const loadStart = Date.now();
    const raw = fs.readFileSync(groupedCacheFile(file), 'utf8');
    perfEvent('grouped-snapload', Date.now() - loadStart, { bytes: raw.length });
    if (raw.length > 128 * 1024 * 1024) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== GROUPED_CACHE_VERSION) return null;
    if (typeof parsed.size !== 'number' || typeof parsed.mtimeMs !== 'number') return null;
    const groups = new Map();
    for (const [sid, arr] of Object.entries(parsed.groups || {})) groups.set(sid, arr);
    return { mtimeMs: parsed.mtimeMs, size: parsed.size, groups, all: Array.isArray(parsed.all) ? parsed.all : null };
  } catch { return null; }
}
function loadGroupedFromDisk(file, st) {
  try {
    const loadStart = Date.now();
    const raw = fs.readFileSync(groupedCacheFile(file), 'utf8');
    perfEvent('grouped-snapload', Date.now() - loadStart, { bytes: raw.length });
    if (raw.length > 128 * 1024 * 1024) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== GROUPED_CACHE_VERSION) return null;
    if (parsed.mtimeMs !== st.mtimeMs || parsed.size !== st.size) return null;
    const groups = new Map();
    for (const [sid, arr] of Object.entries(parsed.groups || {})) groups.set(sid, arr);
    return { groups, all: Array.isArray(parsed.all) ? parsed.all : null };
  } catch { return null; }
}
function saveGroupedToDisk(file, st, entry) {
  try {
    const saveStart = Date.now();
    const obj = { v: GROUPED_CACHE_VERSION, mtimeMs: st.mtimeMs, size: st.size, groups: {}, all: entry.all || [] };
    for (const [sid, arr] of entry.groups) obj.groups[sid] = arr;
    const text = JSON.stringify(obj);
    fs.writeFileSync(groupedCacheFile(file), text);
    perfEvent('grouped-save', Date.now() - saveStart, { bytes: text.length });
  } catch { /* best-effort */ }
}
//B"H 2026-10-19: incremental tail merge — when the shard only GREW (the
//common case: imports appending), parse just the new bytes and merge them
//into the cached groups instead of re-scanning 175MB. Full rebuild only when
//the file shrank or was replaced.
//B"H 2026-10-20 (allPosts-list fix): the merge now maintains the entry's
//alias dimension (byAlias) and heichel-ordered list (all) alongside the
//series groups, with the same remove-then-unshift discipline, so all
//three views stay consistent under append-only growth.
function mergeTailRecords(entry, file, from, to) {
  const fd = fs.openSync(file, 'r');
  try {
    const CHUNK = 4 * 1024 * 1024;
    const buf = Buffer.allocUnsafe(CHUNK);
    let pos = from;
    let leftover = '';
    const removeCompact = (arr, compact) => {
      if (!arr) return;
      const ix = arr.findIndex(p => p.postId === compact.postId && p.heichelId === compact.heichelId);
      if (ix >= 0) arr.splice(ix, 1);
    };
    const applyLine = (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch { return; }
      if (!rec || !rec.key) return;
      const value = rec.value || {};
      const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
      if (!k) return;
      // remove old entry everywhere
      const prev = entry.byKey.get(k);
      if (prev) {
        for (const sid of prev.seriesIds) {
          removeCompact(entry.groups.get(sid), prev.compact);
        }
        if (entry.byAlias) removeCompact(entry.byAlias.get(prev.compact.aliasId || ''), prev.compact);
        if (entry.all) removeCompact(entry.all, prev.compact);
        entry.byKey.delete(k);
      }
      if (rec.op === 'del') return;
      const compact = compactPost(value);
      const seriesIds = new Set(
        [value.seriesId, value.parentSeriesId].map(v => String(v || '')).filter(Boolean)
      );
      if (!seriesIds.size) seriesIds.add('root');
      const sidArr = [...seriesIds];
      entry.byKey.set(k, { seriesIds: sidArr, compact });
      for (const sid of sidArr) {
        if (!entry.groups.has(sid)) entry.groups.set(sid, []);
        entry.groups.get(sid).unshift(compact);
      }
      if (entry.byAlias) {
        const a = compact.aliasId || '';
        if (!entry.byAlias.has(a)) entry.byAlias.set(a, []);
        entry.byAlias.get(a).unshift(compact);
      }
      if (entry.all) entry.all.unshift(compact);
    };
    while (pos < to) {
      const n = fs.readSync(fd, buf, 0, Math.min(CHUNK, to - pos), pos);
      if (n <= 0) break;
      pos += n;
      const text = leftover + buf.subarray(0, n).toString('utf8');
      const lines = text.split('\n');
      leftover = lines.pop();
      for (const line of lines) applyLine(line);
    }
    if (leftover) applyLine(leftover);
  } finally {
    fs.closeSync(fd);
  }
}
/** Derives the heichel-ordered list from grouped data (fallback only). */
function deriveAll(groups) {
  const seen = new Set();
  const all = [];
  for (const arr of groups.values()) {
    for (const compact of arr) {
      const k = allPostKey({ heichelId: compact.heichelId, postId: compact.postId });
      if (!k || seen.has(k)) continue;
      seen.add(k);
      all.push(compact);
    }
  }
  return all;
}
/** Builds the alias dimension (aliasId -> compact posts, newest first). */
function rebuildByAlias(all) {
  const byAlias = new Map();
  for (const compact of all || []) {
    const a = compact.aliasId || '';
    if (!byAlias.has(a)) byAlias.set(a, []);
    byAlias.get(a).push(compact);
  }
  return byAlias;
}
/** Fills any missing derived views on a cached entry, in place. */
function normalizeEntry(entry) {
  if (!entry.all) entry.all = deriveAll(entry.groups);
  if (!entry.byAlias) entry.byAlias = rebuildByAlias(entry.all);
  return entry;
}
function getGroupedEntry($i, heichelId) {
  const cacheKey = 'allPosts|' + heichelId;
  const file = allPostsShardFile($i);
  let st = null;
  if (file) { try { st = fs.statSync(file); } catch { st = null; } }
  if (!file) {
    // B"H 2026-10-20 (json-migration M0 parity): AwtsmoosDB mode has no
    // shard file to stat, so the grouped map used to rebuild in full on
    // EVERY call — and journal a full-scan incident each time. Cache it
    // in memory, validated by the facade's allPosts write generation:
    // every packed write bumps the generation, so a cached grouping is
    // served only while no allPosts write has landed since it was built.
    const dbKey = 'allPostsDb|' + heichelId;
    const generation = shardWriteGeneration('allPosts');
    const hit = groupedCache.get(dbKey);
    if (hit && hit.generation === generation) return normalizeEntry(hit);
    const built = buildAllPostsGrouped({ $i, heichelId, wanted: new Set() });
    const entry = { generation, groups: built.groups, byAlias: built.byAlias, all: built.all, byKey: rebuildByKey(built.groups) };
    groupedCache.set(dbKey, entry);
    return entry;
  }
  if (st) {
    const hit = groupedCache.get(cacheKey);
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return normalizeEntry(hit);
    if (hit && st.size >= hit.size && hit.mtimeMs <= st.mtimeMs) {
      // append-only growth: merge just the tail
      const mergeStart = Date.now();
      mergeTailRecords(hit, file, hit.size, st.size);
      perfEvent('grouped-merge', Date.now() - mergeStart, { tailBytes: st.size - hit.size });
      hit.mtimeMs = st.mtimeMs;
      hit.size = st.size;
      saveGroupedToDisk(file, st, hit);
      return normalizeEntry(hit);
    }
    const disk = loadGroupedFromDisk(file, st);
    if (disk) {
      const entry = { mtimeMs: st.mtimeMs, size: st.size, groups: disk.groups, all: disk.all || deriveAll(disk.groups), byKey: rebuildByKey(disk.groups) };
      entry.byAlias = rebuildByAlias(entry.all);
      groupedCache.set(cacheKey, entry);
      return entry;
    }
    // B"H 2026-10-20 (flap-fix): a STALE snapshot still beats a full
    // rebuild when the shard only GREW since it was saved (the import
    // case): rebuild the key index from the snapshot and merge just the
    // appended tail. Previously any mtime/size mismatch discarded the
    // snapshot and buildAllPostsGrouped re-scanned the whole shard
    // synchronously - the freeze behind the API flap.
    const snap = loadGroupedSnapshot(file);
    if (snap && st.size > snap.size) {
      try {
        const entry = { mtimeMs: snap.mtimeMs, size: snap.size, groups: snap.groups, all: snap.all || deriveAll(snap.groups), byKey: rebuildByKey(snap.groups) };
        entry.byAlias = rebuildByAlias(entry.all);
        const mergeStart = Date.now();
        mergeTailRecords(entry, file, snap.size, st.size);
        perfEvent('grouped-merge', Date.now() - mergeStart, { tailBytes: st.size - snap.size });
        entry.mtimeMs = st.mtimeMs;
        entry.size = st.size;
        groupedCache.set(cacheKey, entry);
        saveGroupedToDisk(file, st, entry);
        return entry;
      } catch { /* snapshot merge failed: fall through to the full build */ }
    }
  }
  const built = buildAllPostsGrouped({ $i, heichelId, wanted: new Set() });
  const entry = { groups: built.groups, byAlias: built.byAlias, all: built.all, byKey: rebuildByKey(built.groups) };
  if (st) {
    entry.mtimeMs = st.mtimeMs;
    entry.size = st.size;
    groupedCache.set(cacheKey, entry);
    saveGroupedToDisk(file, st, entry);
  }
  return entry;
}
function getFullGrouping($i, heichelId) {
  return getGroupedEntry($i, heichelId).groups;
}
/** Rebuilds the postKey -> {seriesIds, compact} index from grouped data. */
function rebuildByKey(groups) {
  const byKey = new Map();
  for (const [sid, arr] of groups) {
    for (const compact of arr) {
      const k = allPostKey({ heichelId: compact.heichelId, postId: compact.postId });
      if (!k || byKey.has(k)) continue;
      const e = byKey.get(k);
      if (e) { if (!e.seriesIds.includes(sid)) e.seriesIds.push(sid); }
      else byKey.set(k, { seriesIds: [sid], compact });
    }
  }
  return byKey;
}
function allPostsGrouped({ $i, heichelId = '', seriesIds = [] } = {}) {
  const wanted = new Set(seriesIds.map(String));
  const full = getFullGrouping($i, heichelId);
  if (!wanted.size) return full;
  const out = new Map();
  for (const sid of wanted) {
    if (full.has(sid)) out.set(sid, full.get(sid));
  }
  return out;
}
function buildAllPostsGrouped({ $i, heichelId = '', wanted = new Set() } = {}) {
  noteFullScan('allPostsGrouped-rebuild'); // SAFEGUARDS 2026-10-20: incident
  const buildStart = Date.now();
  const groups = new Map();
  const byAlias = new Map();
  const all = [];
  const seen = new Set();
  const records = listPackedRecords({ $i, shard: 'allPosts' }).slice().reverse();
  for (const record of records) {
    if (!record || record.op === 'del') continue;
    const value = record.value || {};
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (!k || seen.has(k)) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    seen.add(k);
    const compact = compactPost(value);
    all.push(compact);
    const aliasKey = compact.aliasId || '';
    if (!byAlias.has(aliasKey)) byAlias.set(aliasKey, []);
    byAlias.get(aliasKey).push(compact);
    const claimed = new Set(
      [value.seriesId, value.parentSeriesId].map(v => String(v || '')).filter(Boolean)
    );
    if (!claimed.size) claimed.add('root');
    for (const sid of claimed) {
      if (wanted.size && !wanted.has(sid)) continue;
      if (!groups.has(sid)) groups.set(sid, []);
      groups.get(sid).push(compact);
    }
  }
  perfEvent('grouped-build', Date.now() - buildStart, { bytes: all.length });
  return { groups, byAlias, all };
}
function allPosts({ $i, aliasId = '', heichelId = '', seriesId = '', limit = 500 } = {}) {
  // B"H 2026-10-20 (allPosts-list fix): this used to run an UNCACHED
  // full scan of the whole allPosts shard on EVERY call — journaled as
  // the 'allPosts-list' incident, ~11 calls/min in production, seconds
  // of event-loop block each — because listPackedRecords was re-walked
  // and re-filtered per request. It now selects compact candidates
  // from the grouped build's indexes (series map, alias dimension, or
  // the heichel-ordered list — all produced by the same single pass
  // and stat/generation validated) and point-reads each candidate's
  // latest envelope via readPackedLatest. The value filters below are
  // the original ones, applied to the same latest values in the same
  // newest-first order, so every filtered call pattern (both production
  // callers always pass at least one filter) returns identical results.
  // Only the never-used unfiltered mode differs: a tombstone's empty
  // value no longer surfaces as a stray {} row.
  const entry = getGroupedEntry($i, heichelId);
  let candidates;
  if (seriesId) candidates = entry.groups.get(String(seriesId)) || [];
  else if (aliasId) candidates = entry.byAlias.get(aliasId) || [];
  else candidates = entry.all;
  const seen = new Set();
  const output = [];
  for (const compact of candidates) {
    const envelope = readAllPost({ $i, heichelId: compact.heichelId, postId: compact.postId });
    const value = envelope && envelope.op !== 'del' ? envelope.value : null;
    if (!value) continue;
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (!k || seen.has(k)) continue;
    if (aliasId && (value.aliasId || value.author || '') !== aliasId) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    if (seriesId && value.seriesId !== seriesId && value.parentSeriesId !== seriesId) continue;
    seen.add(k);
    output.push(value);
    if (output.length >= limit) break;
  }
  return output;
}
module.exports = {
  clearGroupedCache, allPostKey, postIdOf, compactPost, fullAllPost, writeAllPost, readAllPost, allPosts, allPostsGrouped };
