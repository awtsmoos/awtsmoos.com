//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/verifier/exclusions.js
 * @chapter A Torn Page Does Not Condemn The Whole Sefer
 * @description
 * Verify-with-exclusions policy (dead-space prevention, design item 1).
 *
 * Before this module, a single torn record — a dictionary leaf whose bytes
 * were half-written when the process was killed — made db.verify() fail,
 * and a failed verify quarantined the ENTIRE persisted free list: no freed
 * range could ever be reused again, so the shard only appended and bloated
 * (the production series shard grew to ~99.7% dead space this way).
 *
 * The verifier's walk marks a record's own range as occupied BEFORE its
 * visitor inspects the record's bytes. When the visitor then rejects the
 * record itself — bad magic, bad inner length, an unparseable token — the
 * failure is confined to that one record: its range is known, already
 * counted as reachable, and is never handed out as free space. Such an
 * error is EXCLUDABLE: the rest of the walk is still trustworthy for
 * judging individual free ranges.
 *
 * An error is excludable only when BOTH hold:
 *   - its reason is a single-record parse failure (the set below), and
 *   - it carries the record pointer with safe-integer offset and a
 *     positive length, so the excluded range is exact.
 * Anything else — an undecodable pointer seal, an exception mid-visit,
 * ledger bound/overlap violations, vector bounds — leaves the walk's
 * completeness in doubt and keeps the report a hard failure.
 *
 * Safety boundary: a torn record's CHILD ranges were never visited, so
 * they hide inside the report's complement. Exclusions therefore never
 * authorize adopting the raw complement; they only authorize judging
 * persisted and pending free ranges one by one (a range the allocator
 * explicitly freed, fully contained in the complement, and not touching
 * any excluded range). Complement adoption still requires a clean verify.
 */

/**
 * Reasons that are single-record parse failures with an exact pointer.
 * Every entry's push site in the visitors passes `ptr: pointer` for the
 * record that failed its own byte-level inspection.
 * @type {Set<string>}
 */
const EXCLUDABLE_REASONS = new Set([
	'bad-dictionary',
	'bad-anchor',
	'bad-anchor-inner-length',
	'bad-anchor-metadata-length',
	'bad-map',
	'bad-sequence',
	'bad-flat-array',
	'bad-blob-token',
	'bad-text-token',
	'empty-custom-body'
]);

/**
 * Maps one verifier error to its exclusion range, or null when the error
 * is not excludable (unknown range, structural violation, partial visit).
 * @param {object} error - One entry of the verifier's bad list.
 * @returns {object|null} { tag, reason, offset, length } or null.
 */
function exclusionOf(error) {
	if (!error || !EXCLUDABLE_REASONS.has(error.reason)) return null;
	const pointer = error.ptr;
	if (!pointer) return null;
	if (!Number.isSafeInteger(pointer.offset)) return null;
	if (!Number.isSafeInteger(pointer.length) || pointer.length <= 0) return null;
	return {
		tag: error.tag || '',
		reason: error.reason,
		offset: pointer.offset,
		length: pointer.length
	};
}

/**
 * Summarizes a verifier error list into the report's exclusion verdict.
 * Degraded is true only when there is at least one error and EVERY error
 * is excludable; a single non-excludable error keeps the whole report a
 * hard failure with no exclusions, exactly as before this module existed.
 * @param {Array<object>} errors - The verifier's bad list.
 * @returns {object} { degraded, exclusions }.
 */
function summarizeExclusions(errors) {
	const list = Array.isArray(errors) ? errors : [];
	if (!list.length) return { degraded: false, exclusions: [] };
	const exclusions = [];
	for (const error of list) {
		const exclusion = exclusionOf(error);
		if (!exclusion) return { degraded: false, exclusions: [] };
		exclusions.push(exclusion);
	}
	return { degraded: true, exclusions };
}

module.exports = {
	EXCLUDABLE_REASONS,
	exclusionOf,
	summarizeExclusions
};
