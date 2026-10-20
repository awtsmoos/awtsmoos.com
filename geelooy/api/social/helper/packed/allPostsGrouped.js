//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsGrouped
 * @description Grouped-entry resolution (memory, disk snapshot, tail merge, rebuild) for the all-post index (split from allPostsIndex.js, verbatim).
 */

	const fs = require('fs');
	const { shardWriteGeneration } = require('./socialPacked.js');
	const { perfEvent } = require('./perfLog.js');
	const { groupedCache, scheduleGroupedSave, supersedeGroupedSave } = require('./allPostsGroupedState.js');
	const { allPostsShardFile, loadGroupedFromDisk, loadGroupedSnapshot, saveGroupedToDisk } = require('./allPostsSnapshot.js');
	const { mergeTailRecords } = require('./allPostsMerge.js');
	const { deriveAll, normalizeEntry, rebuildByAlias, rebuildByKey } = require('./allPostsViews.js');
	const { buildAllPostsGrouped } = require('./allPostsBuild.js');

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
      // B"H 2026-10-20 (churn fix): write-behind — the request returns
      // after the 8–44ms merge; the 187–306ms snapshot save runs on a
      // coalesced timer instead of inside this call.
      scheduleGroupedSave(file, st, hit);
      return normalizeEntry(hit);
    }
    const disk = loadGroupedFromDisk(file, st);
    if (disk) {
      const reindexStart = Date.now();
      const entry = { mtimeMs: st.mtimeMs, size: st.size, groups: disk.groups, all: disk.all || deriveAll(disk.groups), byKey: rebuildByKey(disk.groups) };
      entry.byAlias = rebuildByAlias(entry.all);
      perfEvent('grouped-reindex', Date.now() - reindexStart, {});
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
        const reindexStart = Date.now();
        const entry = { mtimeMs: snap.mtimeMs, size: snap.size, groups: snap.groups, all: snap.all || deriveAll(snap.groups), byKey: rebuildByKey(snap.groups) };
        entry.byAlias = rebuildByAlias(entry.all);
        perfEvent('grouped-reindex', Date.now() - reindexStart, {});
        const mergeStart = Date.now();
        mergeTailRecords(entry, file, snap.size, st.size);
        perfEvent('grouped-merge', Date.now() - mergeStart, { tailBytes: st.size - snap.size });
        entry.mtimeMs = st.mtimeMs;
        entry.size = st.size;
        groupedCache.set(cacheKey, entry);
        scheduleGroupedSave(file, st, entry);
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
    // B"H 2026-10-20 (churn fix): a genuine rebuild keeps its ONE
    // synchronous save (at most once per rebuild) — and supersedes any
    // pending write-behind record, which holds an older entry.
    supersedeGroupedSave(file);
    saveGroupedToDisk(file, st, entry);
  }
  return entry;
}

function getFullGrouping($i, heichelId) {
  return getGroupedEntry($i, heichelId).groups;
}

module.exports = {
	getFullGrouping,
	getGroupedEntry
};
