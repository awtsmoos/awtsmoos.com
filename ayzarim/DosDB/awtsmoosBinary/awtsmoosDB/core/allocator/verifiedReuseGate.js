//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/allocator/verifiedReuseGate.js
 * @chapter The Persisted Memory Must Meet The Present World
 * @description
 * Lazily validates a loaded free list at the first attempted reuse, after the
 * root graph exists. Invalid persisted claims are quarantined in memory and are
 * never rewritten merely because they were rejected.
 *
 * B"H 2026-10-20 (free-space fix): partial adoption. When verify() succeeds
 * but some persisted ranges intersect reachable data, the verified survivors
 * are adopted (state 'verified-partial-complement') and only the bad ranges
 * are quarantined. The old code quarantined the ENTIRE list, so one stale
 * range silently disabled all reuse forever (production series shard ended
 * with 62,684 dead ranges and 0 tracked). Total quarantine now happens only
 * when verify() fails beyond torn records: a degraded verify (every error
 * an excluded torn record) adopts its per-range survivors instead, via
 * degradedAdoption.js (state 'verified-degraded-exclusions').
 */

const validateFreeRanges = require('./freeRangeValidation.js');
const pendingFreeList = require('./pendingFreeList.js');
const { adoptDegraded } = require('./degradedAdoption.js');

/**
 * Engine-fix 2026-10-20 (E3): trust identity is the free-list mutation
 * version (freeListVersion.js), not the old O(n) string signature that
 * cost ~40 ms per allocate/free at ~100k ranges. Mutation sites bump;
 * markTrusted stamps.
 */
const { bumpFreeListVersion } = require('./freeListVersion.js');

/**
 * Marks the allocator's current free list as trusted for reuse.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {string} [state] - verification state label.
 */
function markTrusted(allocator, state = 'trusted-local') {
	allocator._trustedFreeListVersion = allocator._freeListVersion || 0;
	allocator.reuseVerification = {
		state,
		ok: true,
		ranges: allocator.freeList.length,
		checkedAt: Date.now()
	};
}

/**
 * Ensures the allocator's free list has been verified against the live
 * reachable graph before any reuse. Adopts verified survivors on partial
 * failure; quarantines everything only when verify() itself fails.
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {boolean} True when the (possibly reduced) free list is reusable.
 * @throws When options.reuseVerificationFailure === 'throw' and verify fails.
 */
function ensureVerified(allocator) {
	if ((allocator._trustedFreeListVersion ?? -1)
		=== (allocator._freeListVersion || 0)) return true;
	if (allocator.freeList.length === 0
		&& pendingFreeList.load(allocator).length === 0) {
		markTrusted(allocator, 'verified-empty');
		return true;
	}

	const report = allocator.db.verify();
	const result = validateFreeRanges(allocator.freeList, allocator.cursor, report);
	if (result.ok) {
		allocator.freeList = result.ranges;
		bumpFreeListVersion(allocator);
		// Db-hardening 2026-10-20: adopt pending frees (pendingFreeList.js).
		pendingFreeList.promote(allocator, report);
		markTrusted(allocator, 'verified-reachable-complement');
		return true;
	}

	if (report && report.ok === true) {
		const accepted = new Set(
			(result.validRanges || []).map(range => `${range.offset}:${range.length}`)
		);
		allocator.rejectedFreeList = allocator.freeList
			.filter(range => !accepted.has(`${range.offset}:${range.length}`))
			.map(range => ({ ...range }));
		allocator.freeList = result.validRanges || [];
		bumpFreeListVersion(allocator);
		pendingFreeList.promote(allocator, report);
		markTrusted(allocator, 'verified-partial-complement');
		return true;
	}

	if (report && report.degraded === true) {
		return adoptDegraded(allocator, report, result, markTrusted);
	}

	allocator.rejectedFreeList = allocator.freeList.map(range => ({ ...range }));
	allocator.freeList = [];
	bumpFreeListVersion(allocator);
	allocator._trustedFreeListVersion = allocator._freeListVersion;
	allocator.reuseVerification = {
		state: 'rejected-persisted-free-list',
		ok: false,
		errors: result.errors,
		checkedAt: Date.now()
	};

	if (allocator.db.options?.reuseVerificationFailure === 'throw') {
		const error = new Error('B"H verified free-space reuse rejected the persisted free list');
		error.code = 'AWTSMOOS_DB_FREE_LIST_VERIFICATION_FAILED';
		error.details = result.errors;
		throw error;
	}
	return false;
}

module.exports = {
	ensureVerified,
	markTrusted
};
