//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/allocator/freeRangeValidation.js
 * @chapter No Hollow Chamber Is Trusted Without Witnesses
 * @description
 * Compares a persisted free list with a fresh reachable-graph complement. Every candidate must be bounded, non-overlapping, and fully contained in verified free space before one byte may be reused.
 *
 * B"H 2026-10-20 (free-space fix): per-range filtering — each range is
 * judged on its own; verified ranges return in `validRanges`, only the
 * bad ones are quarantined. A range intersecting reachable data is
 * never adopted. A DEGRADED report (verify failed only on torn single
 * records, see core/verifier/exclusions.js) also judges individually:
 * contained in the complement AND clear of every excluded range; `ok`
 * is never true when degraded.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');

/**
 * Builds a containment checker over a merged (sorted, disjoint)
 * complement. Engine-fix 2026-10-20: the old per-range linear scan of
 * the whole complement was O(n*m) — ~15 s at 91k ranges, paid at the
 * first reuse after every open. Candidates are judged in ascending
 * offset order, so a single forward pointer sweep is O(n + m).
 * @param {Array<object>} mergedFree - Coalesced verify() complement.
 * @returns {Function} (range) => boolean, for ascending candidates.
 */
function makeContainmentChecker(mergedFree) {
	let index = -1;
	return function containedByVerifiedFree(range) {
		while (index + 1 < mergedFree.length
			&& mergedFree[index + 1].offset <= range.offset) index++;
		if (index < 0) return false;
		const container = mergedFree[index];
		return container.offset + container.length >= range.offset + range.length;
	};
}
/**
 * True when a verify report is degraded (see header note).
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
 * Checks overlap between a candidate range and any excluded range
 * (excluded ranges count as reachable; this guard is explicit defense).
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
 * @returns {object} { ok, errors, ranges, validRanges } — ok is true only
 * when every range validated; validRanges holds the survivors regardless.
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
	let mergedFree;
	try {
		mergedFree = coalesceFreeRanges(verifiedFree, cursor);
	} catch (error) {
		errors.push({ reason: 'invalid-verified-complement', message: error.message });
		return { ok: false, errors, ranges: [], validRanges };
	}
	const containedByVerifiedFree = makeContainmentChecker(mergedFree);
	const exclusions = degraded ? verificationReport.exclusions : [];
	for (const range of normalized) {
		if (!containedByVerifiedFree(range)) {
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
