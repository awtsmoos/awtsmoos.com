//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsSnapshot
 * @description Grouped-snapshot file naming, load and save for the all-post index (split from allPostsIndex.js, verbatim).
 */

	const fs = require('fs');
	const { shardFile, SHARDS } = require('./shardPaths.js');
	const { effectiveRoot } = require('./socialPacked.js');
	const { perfEvent } = require('./perfLog.js');

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
    if (raw.length > 128 * 1024 * 1024) return null;
    const parsed = JSON.parse(raw);
    // B"H 2026-10-20 (churn fix): the snapload timing now covers the
    // JSON.parse too — it previously stopped at the file read and
    // under-measured loading a 17MB snapshot.
    perfEvent('grouped-snapload', Date.now() - loadStart, { bytes: raw.length });
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
    if (raw.length > 128 * 1024 * 1024) return null;
    const parsed = JSON.parse(raw);
    perfEvent('grouped-snapload', Date.now() - loadStart, { bytes: raw.length });
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
    // B"H 2026-10-20 (churn fix): persist via a sibling temp file +
    // rename, so a crash mid-save can never leave a torn snapshot
    // behind — the last good snapshot stays loadable and tail-merges
    // forward on the next start. Same path, same format, same bytes.
    const target = groupedCacheFile(file);
    const tmp = target + '.tmp';
    fs.writeFileSync(tmp, text);
    fs.renameSync(tmp, target);
    perfEvent('grouped-save', Date.now() - saveStart, { bytes: text.length });
  } catch { /* best-effort */ }
}

module.exports = {
	GROUPED_CACHE_VERSION,
	allPostsShardFile,
	groupedCacheFile,
	loadGroupedFromDisk,
	loadGroupedSnapshot,
	saveGroupedToDisk
};
