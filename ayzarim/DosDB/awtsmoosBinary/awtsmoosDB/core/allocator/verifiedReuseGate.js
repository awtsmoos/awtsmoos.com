// B"H

/**
 * @file core/allocator/verifiedReuseGate.js
 * @chapter The Persisted Memory Must Meet The Present World
 * @description
 * Lazily validates a loaded free list at the first attempted reuse, after the
 * root graph exists. Invalid persisted claims are quarantined in memory and are
 * never rewritten merely because they were rejected.
 */

const validateFreeRanges = require('./freeRangeValidation.js');

function signature(ranges) {
	return (Array.isArray(ranges) ? ranges : [])
		.map(range => `${range.offset}:${range.length}`)
		.join('|');
}

function markTrusted(allocator, state = 'trusted-local') {
	allocator._trustedFreeListSignature = signature(allocator.freeList);
	allocator.reuseVerification = {
		state,
		ok: true,
		ranges: allocator.freeList.length,
		checkedAt: Date.now()
	};
}

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
