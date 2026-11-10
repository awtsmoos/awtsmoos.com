// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/reachableComplement.js
 * @chapter The Verified Void Excludes Every Leased Body
 * @description
 * Adopts the complete reachable complement only at outer rest, then subtracts unlinked external-body leases before any range can be reused.
 */
const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const { bumpFreeListVersion } = require('./freeListVersion.js');
const cursorState = require('./cursorState.js');
const allocationLeases = require('./allocationLeases.js');
const { markTrusted } = require('./verifiedReuseGate.js');
const { isRefreshDeferred } = require('./refreshDeferral.js');

// Engine-fix 2026-10-20 (E4/E7): a refresh is a full graph verify —
// cheap on small graphs, seconds-to-minutes at scale (gated below).
const REFRESH_MIN_GROWTH = 4 * 1024 * 1024;
const SMALL_GRAPH_BYTES = 16 * 1024 * 1024;
const MIN_POOL_PRESSURE_BYTES = 8 * 1024 * 1024;
const MIN_REUSE_RANGE = 64;
const MAX_ADOPTED_RANGES = 65536;
function refreshVerifiedComplement(allocator) {
	if (!shouldRefresh(allocator)) return { refreshed: false, skipped: true };
	allocator._lastRefreshCursor = allocator.cursor;
	const report = allocator.db.verify();
	if (!report?.ok && report?.degraded === true) return degradeVerification(allocator, report);
	if (!report?.ok) return rejectVerification(allocator, report);
	const previousVersion = allocator._freeListVersion || 0;
	const previousCursor = allocator.cursor;
	const available = allocationLeases.subtract(report.free || [], allocator._allocationLeases);
	// Db-phase2: the fresh complement subsumes both provenance pools;
	// adoption drops (dust/overflow) are deposited into the deferred
	// spill by adoptComplement instead of being dropped permanently.
	allocator.clearDerivedPools();
	allocator.freeList = adoptComplement(coalesceFreeRanges(available, allocator.cursor), allocator.cursor, allocator);
	// Speed fix 2026-11-10: wholesale replacement — the size-sorted index is stale.
	allocator._freeBySizeValid = false;
	bumpFreeListVersion(allocator);
	cursorState.absorbTrailingGaps(allocator);
	cursorState.flush(allocator);
	markTrusted(allocator, 'verified-complete-complement');
	allocator._needsComplementRefresh = false;
	const changed = previousCursor !== allocator.cursor || previousVersion !== (allocator._freeListVersion || 0);
	if (changed) allocator._freeListDirty = true;
	return {
		refreshed: true, changed, cursor: allocator.cursor,
		leases: allocator._allocationLeases.size,
		freeRanges: allocator.freeList.length,
		freeBytes: allocator.freeList.reduce((sum, range) => sum + range.length, 0)
	};
}
/**
 * Shapes a coalesced complement for adoption (E7): sub-64 B dust is
 * dropped, the cursor-touching range is always kept (tail truncation),
 * and beyond MAX_ADOPTED_RANGES the smallest ranges are dropped.
 * Db-phase2: when `sink` (an allocator) is given, dropped ranges are
 * DEPOSITED into its deferred spill (rangeTrust.js) with their drop
 * kind instead of being dropped permanently — their freedom was proven
 * by the verify that produced this complement, so they stay available
 * for later validated reuse and are counted in free-space telemetry.
 * @param {Array<object>} coalesced - Sorted coalesced complement.
 * @param {number} cursor - Allocator cursor at adoption time.
 * @param {number} [sink] - Allocator receiving deferred drops.
 * @returns {Array<object>} Sorted ranges ready to become the free list.
 */
function adoptComplement(coalesced, cursor, sink) {
	const usable = [];
	for (const range of coalesced) {
		if (range.length >= MIN_REUSE_RANGE || range.offset + range.length === cursor) {
			usable.push(range);
		} else if (sink) {
			sink.depositDeferredRange(range, 'dust');
		}
	}
	if (usable.length <= MAX_ADOPTED_RANGES) return usable;
	const bySize = [...usable].sort((a, b) => b.length - a.length);
	const keep = new Set(bySize.slice(0, MAX_ADOPTED_RANGES - 1).map(range => range.offset));
	if (usable.length) keep.add(usable[usable.length - 1].offset);
	const adopted = [];
	for (const range of usable) {
		if (keep.has(range.offset)) adopted.push(range);
		else if (sink) sink.depositDeferredRange(range, 'overflow');
	}
	return adopted;
}
function shouldRefresh(allocator) {
	// Speed fix 2026-11-10 (C): a bulk import defers the refresh while
	// it runs. A refresh is a full-graph verify (seconds-to-minutes at
	// 14 GB); the growth gate lets it fire about every 270 posts
	// mid-import, stalling the job for the whole verify each time.
	// The job clears the deferral when it ends, and the next idle
	// boundary or maintenance timer runs the one refresh the job earned.
	if (isRefreshDeferred()) return false;
	const database = allocator.db;
	const base = database.options?.reuseFreedSpace === 'verified'
		&& !database.options?.readOnly
		&& !allocator.legacySuperblockless
		&& !allocator._savingFreeList
		&& database._insideWaitForIdle === true
		&& database.pager?.isBatching !== true
		&& allocator._needsComplementRefresh === true;
	if (!base) return false;
	// Small graphs verify in milliseconds: refresh at any flagged idle.
	if (allocator.cursor <= SMALL_GRAPH_BYTES) return true;
	// First idle: anchor the growth baseline; empty list forces discovery.
	if (allocator._lastRefreshCursor == null) {
		allocator._lastRefreshCursor = allocator.cursor;
		return allocator.freeList.length === 0;
	}
	if (allocator.freeList.length === 0) return true;
	if (allocator.cursor - allocator._lastRefreshCursor < REFRESH_MIN_GROWTH) return false;
	// Plentiful tracked pool: recovery can wait. A verify is O(graph);
	// firing one per batch while the pool already holds ample verified
	// space makes bulk conversions quadratic (measured: 175 s batches
	// at 132k records). Refresh resumes when the pool drains.
	const freeBytes = allocator.freeList.reduce((sum, range) => sum + range.length, 0);
	return freeBytes < Math.max(MIN_POOL_PRESSURE_BYTES, allocator.cursor * 0.02);
}
/**
 * Records a degraded verify (torn records only) WITHOUT adopting the
 * complement. Per-range reuse continues via degradedAdoption.js.
 */
function degradeVerification(allocator, report) {
	allocator.reuseVerification = {
		state: 'verified-degraded-exclusions', ok: true, degraded: true,
		exclusions: (report.exclusions || []).length,
		errors: report.errors || [], checkedAt: Date.now()
	};
	return { refreshed: false, degraded: true, exclusions: report.exclusions || [] };
}

function rejectVerification(allocator, report) {
	allocator.reuseVerification = {
		state: 'reachable-complement-verification-failed', ok: false,
		errors: report?.errors || [{ reason: 'missing-verification-report' }],
		checkedAt: Date.now()
	};
	if (allocator.db.options?.reuseVerificationFailure === 'throw') {
		const error = new Error('B"H reachable complement verification failed');
		error.code = 'AWTSMOOS_DB_COMPLEMENT_VERIFICATION_FAILED';
		error.details = allocator.reuseVerification.errors;
		throw error;
	}
	return { refreshed: false, rejected: true, report };
}

refreshVerifiedComplement.adoptComplement = adoptComplement;
module.exports = refreshVerifiedComplement;
