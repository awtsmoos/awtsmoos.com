// B"H

/**
 * @file core/allocator/freeRangeValidation.js
 * @chapter No Hollow Chamber Is Trusted Without Witnesses
 * @description
 * Compares a persisted free list with a fresh reachable-graph complement. Every
 * candidate must be bounded, non-overlapping, and fully contained in verified
 * free space before one byte may be reused.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');

function containedByVerifiedFree(range, verifiedFree) {
	return verifiedFree.some(candidate => {
		return candidate.offset <= range.offset
			&& candidate.offset + candidate.length >= range.offset + range.length;
	});
}

function validateFreeRanges(ranges, cursor, verificationReport) {
	const errors = [];
	let normalized = [];

	if (!verificationReport || verificationReport.ok !== true) {
		errors.push({ reason: 'reachable-verification-failed', errors: verificationReport && verificationReport.errors });
		return { ok: false, errors, ranges: [] };
	}

	try {
		normalized = coalesceFreeRanges(ranges, cursor);
	} catch (error) {
		errors.push({ reason: error.code || 'invalid-free-range', message: error.message, range: error.range });
		return { ok: false, errors, ranges: [] };
	}

	const verifiedFree = Array.isArray(verificationReport.free) ? verificationReport.free : [];
	for (const range of normalized) {
		if (!containedByVerifiedFree(range, verifiedFree)) {
			errors.push({ reason: 'free-range-intersects-reachable-data', range });
		}
	}

	return {
		ok: errors.length === 0,
		errors,
		ranges: errors.length === 0 ? normalized : []
	};
}

module.exports = validateFreeRanges;
