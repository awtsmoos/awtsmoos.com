//B"H
/**
 * @module AllPostsIndex
 * @description Chapter 645: all-post index operations now pass through the
 * same hybrid packed writer as posts, migrations, and tests. A local `$i` root
 * receives JSONL shards; production without `$i.db.directory` uses AwtsmoosDB.
 */
const fs = require('fs');
const { logicalKey, shardFile, SHARDS } = require('./shardPaths.js');
const { writePacked, readPacked, listPackedRecords, excerptOf, fileRoot } = require('./socialPacked.js');

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
  return readPacked({ $i, shard: 'allPosts', key: allPostKey({ heichelId, postId }) });
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
/** BH 2026-10-19: clears grouped cache after bulk writes. */
function clearGroupedCache() { groupedCache.clear(); } // 'allPosts|<heichelId>' -> { mtimeMs, size, groups }
const GROUPED_CACHE_VERSION = 1;
function allPostsShardFile($i) {
  try {
    const root = fileRoot($i);
    if (!root || !SHARDS || !SHARDS['allPosts']) return '';
    return shardFile(root, 'allPosts') || '';
  } catch { return ''; }
}
function groupedCacheFile(file) { return file + '.grouped.json'; }
function loadGroupedFromDisk(file, st) {
  try {
    const raw = fs.readFileSync(groupedCacheFile(file), 'utf8');
    if (raw.length > 128 * 1024 * 1024) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== GROUPED_CACHE_VERSION) return null;
    if (parsed.mtimeMs !== st.mtimeMs || parsed.size !== st.size) return null;
    const groups = new Map();
    for (const [sid, arr] of Object.entries(parsed.groups || {})) groups.set(sid, arr);
    return groups;
  } catch { return null; }
}
function saveGroupedToDisk(file, st, groups) {
  try {
    const obj = { v: GROUPED_CACHE_VERSION, mtimeMs: st.mtimeMs, size: st.size, groups: {} };
    for (const [sid, arr] of groups) obj.groups[sid] = arr;
    fs.writeFileSync(groupedCacheFile(file), JSON.stringify(obj));
  } catch { /* best-effort */ }
}
//B"H 2026-10-19: incremental tail merge — when the shard only GREW (the
//common case: imports appending), parse just the new bytes and merge them
//into the cached groups instead of re-scanning 175MB. Full rebuild only when
//the file shrank or was replaced.
function mergeTailRecords(entry, file, from, to) {
  const fd = fs.openSync(file, 'r');
  try {
    const CHUNK = 4 * 1024 * 1024;
    const buf = Buffer.allocUnsafe(CHUNK);
    let pos = from;
    let leftover = '';
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
          const arr = entry.groups.get(sid);
          if (arr) {
            const ix = arr.findIndex(p => p.postId === prev.compact.postId && p.heichelId === prev.compact.heichelId);
            if (ix >= 0) arr.splice(ix, 1);
          }
        }
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
function getFullGrouping($i, heichelId) {
  const cacheKey = 'allPosts|' + heichelId;
  const file = allPostsShardFile($i);
  let st = null;
  if (file) { try { st = fs.statSync(file); } catch { st = null; } }
  if (st) {
    const hit = groupedCache.get(cacheKey);
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.groups;
    if (hit && st.size >= hit.size && hit.mtimeMs <= st.mtimeMs) {
      // append-only growth: merge just the tail
      mergeTailRecords(hit, file, hit.size, st.size);
      hit.mtimeMs = st.mtimeMs;
      hit.size = st.size;
      saveGroupedToDisk(file, st, hit.groups);
      return hit.groups;
    }
    const diskGroups = loadGroupedFromDisk(file, st);
    if (diskGroups) {
      const entry = { mtimeMs: st.mtimeMs, size: st.size, groups: diskGroups, byKey: rebuildByKey(diskGroups) };
      groupedCache.set(cacheKey, entry);
      return diskGroups;
    }
  }
  const groups = buildAllPostsGrouped({ $i, heichelId, wanted: new Set() });
  if (st) {
    const entry = { mtimeMs: st.mtimeMs, size: st.size, groups, byKey: rebuildByKey(groups) };
    groupedCache.set(cacheKey, entry);
    saveGroupedToDisk(file, st, groups);
  }
  return groups;
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
  const groups = new Map();
  const seen = new Set();
  const records = listPackedRecords({ $i, shard: 'allPosts' }).slice().reverse();
  for (const record of records) {
    if (!record || record.op === 'del') continue;
    const value = record.value || {};
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (!k || seen.has(k)) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    seen.add(k);
    const claimed = new Set(
      [value.seriesId, value.parentSeriesId].map(v => String(v || '')).filter(Boolean)
    );
    if (!claimed.size) claimed.add('root');
    for (const sid of claimed) {
      if (wanted.size && !wanted.has(sid)) continue;
      if (!groups.has(sid)) groups.set(sid, []);
      groups.get(sid).push(compactPost(value));
    }
  }
  return groups;
}
function allPosts({ $i, aliasId = '', heichelId = '', seriesId = '', limit = 500 } = {}) {
  const seen = new Set();
  const output = [];
  const records = listPackedRecords({ $i, shard: 'allPosts' }).slice().reverse();
  for (const record of records) {
    const value = record.value || {};
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (seen.has(k)) continue;
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
