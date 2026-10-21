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
	allocator.freeList = adoptComplement(coalesceFreeRanges(available, allocator.cursor), allocator.cursor);
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
 * @param {Array<object>} coalesced - Sorted coalesced complement.
 * @param {number} cursor - Allocator cursor at adoption time.
 * @returns {Array<object>} Sorted ranges ready to become the free list.
 */
function adoptComplement(coalesced, cursor) {
	const usable = coalesced.filter(range => range.length >= MIN_REUSE_RANGE
		|| range.offset + range.length === cursor);
	if (usable.length <= MAX_ADOPTED_RANGES) return usable;
	const bySize = [...usable].sort((a, b) => b.length - a.length);
	const keep = new Set(bySize.slice(0, MAX_ADOPTED_RANGES - 1).map(range => range.offset));
	if (usable.length) keep.add(usable[usable.length - 1].offset);
	return usable.filter(range => keep.has(range.offset));
}
function shouldRefresh(allocator) {
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
