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
 * when verify() itself fails, when nothing can be trusted.
 */

const validateFreeRanges = require('./freeRangeValidation.js');

/**
 * Compact identity of a free list, used to detect re-validation needs.
 * @param {Array<object>} ranges - free ranges.
 * @returns {string} Signature string of offset:length pairs.
 */
function signature(ranges) {
	return (Array.isArray(ranges) ? ranges : [])
		.map(range => `${range.offset}:${range.length}`)
		.join('|');
}

/**
 * Marks the allocator's current free list as trusted for reuse.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {string} [state] - verification state label.
 * @returns {void}
 */
function markTrusted(allocator, state = 'trusted-local') {
	allocator._trustedFreeListSignature = signature(allocator.freeList);
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
	const currentSignature = signature(allocator.freeList);
	if (allocator._trustedFreeListSignature === currentSignature) return true;
	if (allocator.freeList.length === 0) {
		markTrusted(allocator, 'verified-empty');
		return true;
	}

	const report = allocator.db.verify();
	const result = validateFreeRanges(allocator.freeList, allocator.cursor, report);
	if (result.ok) {
		allocator.freeList = result.ranges;
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
		markTrusted(allocator, 'verified-partial-complement');
		return true;
	}

	allocator.rejectedFreeList = allocator.freeList.map(range => ({ ...range }));
	allocator.freeList = [];
	allocator._trustedFreeListSignature = signature([]);
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
