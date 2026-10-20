//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/allocator/freeRangeValidation.js
 * @chapter No Hollow Chamber Is Trusted Without Witnesses
 * @description
 * Compares a persisted free list with a fresh reachable-graph complement. Every
 * candidate must be bounded, non-overlapping, and fully contained in verified
 * free space before one byte may be reused.
 *
 * B"H 2026-10-20 (free-space fix): per-range filtering. The old code returned
 * an all-or-nothing verdict: one bad range poisoned the whole list and the
 * gate quarantined EVERYTHING. Now each range is judged on its own: verified
 * ranges are returned in `validRanges` and only the bad ones are quarantined.
 * The safety property is unchanged: a range that intersects reachable data is
 * never adopted for reuse.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');

/**
 * Checks that a candidate range lies fully inside verified free space.
 * @param {object} range - { offset, length } candidate.
 * @param {Array<object>} verifiedFree - verify() complement ranges.
 * @returns {boolean} True when the range is fully contained.
 */
function containedByVerifiedFree(range, verifiedFree) {
	return verifiedFree.some(candidate => {
		return candidate.offset <= range.offset
			&& candidate.offset + candidate.length >= range.offset + range.length;
	});
}

/**
 * Validates persisted free ranges against a verification report.
 * @param {Array<object>} ranges - persisted free list.
 * @param {number} cursor - allocator cursor (upper bound).
 * @param {object} verificationReport - db.verify() report with .ok and .free.
 * @returns {object} { ok, errors, ranges, validRanges }.
 * ok is true only when every range validated; validRanges holds the
 * individually-verified survivors even when ok is false.
 */
function validateFreeRanges(ranges, cursor, verificationReport) {
	const errors = [];
	const validRanges = [];
	let normalized = [];

	if (!verificationReport || verificationReport.ok !== true) {
		errors.push({ reason: 'reachable-verification-failed', errors: verificationReport && verificationReport.errors });
		return { ok: false, errors, ranges: [], validRanges };
	}

	try {
		normalized = coalesceFreeRanges(ranges, cursor);
	} catch (error) {
		errors.push({ reason: error.code || 'invalid-free-range', message: error.message, range: error.range });
		return { ok: false, errors, ranges: [], validRanges };
	}

	const verifiedFree = Array.isArray(verificationReport.free) ? verificationReport.free : [];
	for (const range of normalized) {
		if (!containedByVerifiedFree(range, verifiedFree)) {
			errors.push({ reason: 'free-range-intersects-reachable-data', range });
		} else {
			validRanges.push(range);
		}
	}

	return {
		ok: errors.length === 0,
		errors,
		ranges: errors.length === 0 ? normalized : [],
		validRanges
	};
}

module.exports = validateFreeRanges;
