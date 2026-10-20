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
 *
 * B"H 2026-10-20 (verify-with-exclusions): a DEGRADED report — verify failed
 * only on torn single records with exact, already-occupied ranges (see
 * core/verifier/exclusions.js) — also judges ranges individually: contained
 * in the complement AND clear of every excluded range. Any other failed
 * report still judges zero ranges; `ok` is never true when degraded.
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
 * True when a verify report is degraded: not ok, but every error was an
 * excluded torn record and the complement is present to judge against.
 * @param {object} report - db.verify() report.
 * @returns {boolean} True when per-range judging may proceed.
 */
function isDegradedReport(report) {
	return Boolean(report)
		&& report.ok !== true
		&& report.degraded === true
		&& Array.isArray(report.exclusions)
		&& report.exclusions.length > 0
		&& Array.isArray(report.free);
}

/**
 * Checks overlap between a candidate range and any excluded range.
 * Excluded ranges are already counted reachable, so a contained candidate
 * can never touch one; this guard keeps the invariant explicit regardless.
 * @param {object} range - { offset, length } candidate.
 * @param {Array<object>} exclusions - excluded { offset, length } ranges.
 * @returns {boolean} True when the candidate intersects an exclusion.
 */
function intersectsExclusion(range, exclusions) {
	return exclusions.some(excluded => {
		return range.offset < excluded.offset + excluded.length
			&& excluded.offset < range.offset + range.length;
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
	const degraded = isDegradedReport(verificationReport);

	if (!verificationReport || (verificationReport.ok !== true && !degraded)) {
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
	const exclusions = degraded ? verificationReport.exclusions : [];
	for (const range of normalized) {
		if (!containedByVerifiedFree(range, verifiedFree)) {
			errors.push({ reason: 'free-range-intersects-reachable-data', range });
		} else if (degraded && intersectsExclusion(range, exclusions)) {
			errors.push({ reason: 'free-range-intersects-excluded-range', range });
		} else {
			validRanges.push(range);
		}
	}

	return {
		ok: !degraded && errors.length === 0,
		degraded,
		errors,
		ranges: !degraded && errors.length === 0 ? normalized : [],
		validRanges
	};
}

module.exports = validateFreeRanges;
