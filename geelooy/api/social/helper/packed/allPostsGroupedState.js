//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsGroupedState
 * @description State owner for the grouped all-post cache and its write-behind save state (split from allPostsIndex.js, verbatim).
 */

	const { groupedCacheFile, saveGroupedToDisk } = require('./allPostsSnapshot.js');

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

/**
 * B"H 2026-10-20 (churn fix): grouped snapshot saves are WRITE-BEHIND.
 * The [PERF] journal under live import load (22:13–22:20 UTC, MainPID
 * 1264872) apportioned the residual feed stall: tail merges cost
 * 8–44ms, but the synchronous save each merge triggered cost
 * 187–306ms (17MB stringify + write) ON THE REQUEST PATH, once per
 * import batch — the first reader after every append paid it, and the
 * loop blocked ~1.6s/min for everyone else. Saves now never run
 * inside getGroupedEntry: merges mark their entry pending and an
 * unref'd timer persists it, coalescing bursts and rate-limiting
 * actual writes to one per GROUPED_SAVE_MIN_GAP_MS per snapshot file.
 * The stringify happens at fire time from the live entry, so the
 * persisted snapshot is at least as fresh as today's. The snapshot is
 * only an accelerator (watermark-validated, tail-merged forward on
 * load), so a save lost to a process exit costs at most one tail
 * merge from an older watermark — never correctness.
 */
const GROUPED_SAVE_DELAY_MS = 5000;
const GROUPED_SAVE_MIN_GAP_MS = 20000;
const groupedSaveState = new Map(); // cacheFile -> {timer, pending, lastSaveAt}
function scheduleGroupedSave(file, st, entry) {
  const target = groupedCacheFile(file);
  let state = groupedSaveState.get(target);
  if (!state) { state = { timer: null, pending: null, lastSaveAt: 0 }; groupedSaveState.set(target, state); }
  state.pending = { file, st, entry };
  if (state.timer) return;
  const sinceLast = Date.now() - state.lastSaveAt;
  const wait = Math.max(GROUPED_SAVE_DELAY_MS, GROUPED_SAVE_MIN_GAP_MS - sinceLast);
  state.timer = setTimeout(() => {
    state.timer = null;
    const pending = state.pending;
    state.pending = null;
    if (!pending) return;
    state.lastSaveAt = Date.now();
    saveGroupedToDisk(pending.file, pending.st, pending.entry);
  }, wait);
  if (state.timer && typeof state.timer.unref === 'function') state.timer.unref();
}
/** Persists every pending grouped snapshot now (tests, shutdown). */
function flushGroupedSaves() {
  for (const state of groupedSaveState.values()) {
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    const pending = state.pending;
    state.pending = null;
    if (pending) { state.lastSaveAt = Date.now(); saveGroupedToDisk(pending.file, pending.st, pending.entry); }
  }
}
/**
 * A synchronous save (the full-build path) supersedes any pending
 * write-behind save for the same snapshot file: the pending record
 * holds an older entry/watermark and must never overwrite the fresher
 * snapshot the build is about to write.
 */
function supersedeGroupedSave(file) {
  const state = groupedSaveState.get(groupedCacheFile(file));
  if (!state) return;
  if (state.timer) { clearTimeout(state.timer); state.timer = null; }
  state.pending = null;
  state.lastSaveAt = Date.now();
}

module.exports = {
	clearGroupedCache,
	flushGroupedSaves,
	groupedCache,
	scheduleGroupedSave,
	supersedeGroupedSave
};
