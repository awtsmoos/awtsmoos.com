//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/allocator/degradedAdoption.js
 * @chapter The Sefer Lives Though A Page Is Torn
 * @description
 * Degraded adoption for the verified-reuse gate (dead-space prevention,
 * design item 1). When db.verify() fails ONLY on torn single records —
 * each with an exact range the walk already counted as occupied (see
 * core/verifier/exclusions.js) — the old gate quarantined the entire
 * persisted free list and reuse stopped forever; the shard then only
 * appended and bloated (the series-shard failure mode).
 *
 * This module performs the degraded verdict instead: ranges that
 * freeRangeValidation judged individually against the degraded report
 * (fully contained in the complement, clear of every excluded range)
 * are adopted; only the failures are quarantined; pending frees are
 * promoted through the same per-range judgment. The raw complement is
 * NEVER adopted here — a torn record's unvisited children hide inside
 * it, so wholesale adoption could hand live bytes to the allocator.
 * Excluded ranges stay permanently occupied; the supervised vacuum
 * remains the recovery path for the torn records themselves.
 */

const pendingFreeList = require('./pendingFreeList.js');
const { bumpFreeListVersion } = require('./freeListVersion.js');

/**
 * Adopts the individually-validated survivors of a degraded verify.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {object} report - db.verify() report with degraded === true.
 * @param {object} validation - validateFreeRanges result for the free list.
 * @param {Function} markTrusted - The gate's trust stamper (injected to
 *   keep this module free of a circular require on the gate).
 * @returns {boolean} Always true: the adopted list is reusable.
 */
function adoptDegraded(allocator, report, validation, markTrusted) {
	const validRanges = validation.validRanges || [];
	const accepted = new Set(
		validRanges.map(range => `${range.offset}:${range.length}`)
	);
	allocator.rejectedFreeList = allocator.freeList
		.filter(range => !accepted.has(`${range.offset}:${range.length}`))
		.map(range => ({ ...range }));
	allocator.freeList = validRanges;
	bumpFreeListVersion(allocator);
	pendingFreeList.promote(allocator, report);
	markTrusted(allocator, 'verified-degraded-exclusions');
	allocator.reuseVerification.degraded = true;
	allocator.reuseVerification.exclusions = (report.exclusions || []).length;
	return true;
}

module.exports = { adoptDegraded };
