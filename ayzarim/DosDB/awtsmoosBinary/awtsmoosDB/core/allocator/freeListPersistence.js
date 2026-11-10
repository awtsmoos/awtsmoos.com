// B"H

/**
 * @file core/allocator/freeListPersistence.js
 * @chapter A Thousand Local Changes Become One Durable Ledger At The Boundary
 * @description
 * Coalesces free-list metadata writes across database batches. The in-memory
 * allocator remains current after every operation, while one seal is written at
 * the outer idle boundary instead of once per HNSW neighbor update.
 *
 * Speed fix 2026-11-10 (G): schedule() used to flush the seal SYNCHRONOUSLY
 * on every allocate/free whenever the pager was not batching — and a
 * db.fs.write does not set isBatching, so every single post write paid a
 * full seal write (filter + sort + encode the whole free list, then a
 * superblock flush). On a seeded store (51k ranges) that is ~140 ms per
 * operation — the dominant per-post cost (probe #4: a bare allocate took
 * 138 ms, a raw FS3 write 141 ms, a flush 1,214 ms). Now schedule() only
 * marks dirty and flushes synchronously at most once per 30 s; the idle
 * boundary (waitForIdle, called at every db.batch() end and db.fs.flush())
 * still writes the seal every time via flushPendingFreeList(), so
 * durability at the boundary is unchanged. The seal is a cache of the
 * reachable free list (rebuilt by verify on open), never the source of
 * truth, so a bounded delay is safe.
 */

// Longest the seal may go stale between synchronous writes when no
// idle boundary intervenes. A burst of writes (an import job) pays at
// most one seal write per interval; the job-end flush writes it anyway.
const SEAL_FLUSH_MIN_INTERVAL_MS = 30000;
// Shortest gap between two seal writes from flush() itself. A single
// logical flush (or one live-handle set) can reach flush() 5-20 times
// through nested batch/idle boundaries — probe #5: one db.root set did
// 20 seal writes (212 ms), one db.fs.flush() did 5 (354 ms). The seal
// is a cache, not user data, so writing it once per boundary (not once
// per nested call) is safe and removes the dominant flush cost.
const FLUSH_DEDUPE_MS = 1000;

function schedule(allocator) {
	if (allocator.legacySuperblockless || allocator.db.options?.readOnly) return;
	allocator._freeListDirty = true;
	if (allocator.pager.isBatching) return;
	// Speed fix (G): do not flush the seal on every allocate/free.
	// A burst of writes would otherwise pay a full seal write
	// (O(free-list size), ~140 ms at 51k ranges) per operation.
	// Flush at most once per interval; the idle boundary still flushes
	// every time via flushPendingFreeList().
	const now = Date.now();
	const last = allocator._lastFreeListSealFlushMs || 0;
	if (now - last < SEAL_FLUSH_MIN_INTERVAL_MS) return;
	flush(allocator);
}

function flush(allocator) {
	if (!allocator._freeListDirty || allocator._savingFreeList) return false;
	if (allocator.legacySuperblockless || allocator.db.options?.readOnly) return false;
	if (typeof allocator.db._saveFreeListSeal !== 'function') return false;
	// Speed fix (H): deduplicate nested seal writes within one boundary.
	// waitForIdle / db.batch() / store.put can each reach flush() several
	// times for a single logical operation; the seal only needs one write
	// per boundary, and the next boundary (after the dedupe window) writes
	// it again if it is still dirty.
	const now = Date.now();
	const last = allocator._lastFreeListSealFlushMs || 0;
	if (now - last < FLUSH_DEDUPE_MS) return false;
	allocator._savingFreeList = true;
	try {
		allocator._freeListDirty = false;
		allocator.db._saveFreeListSeal();
		allocator._lastFreeListSealFlushMs = Date.now();
		return true;
	} catch (error) {
		allocator._freeListDirty = true;
		throw error;
	} finally {
		allocator._savingFreeList = false;
	}
}

function clear(allocator) {
	allocator._freeListDirty = false;
}

module.exports = {
	clear,
	flush,
	schedule
};
