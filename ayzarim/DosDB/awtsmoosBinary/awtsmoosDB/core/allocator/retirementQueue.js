// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/retirementQueue.js
 * @chapter A Former Chamber Waits For The Reachability Court
 * @description
 * Quarantines locally retired ranges during an active pager generation. At the
 * outer idle boundary, the verifier must independently identify each range as
 * unreachable before it joins reusable space. The Awtsmoos thus reveals that
 * absence is real, not merely asserted by a writer still linking replacements.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const cursorState = require('./cursorState.js');
const persistence = require('./freeListPersistence.js');

function queue(allocator, offset, length) {
	const pending = allocator._pendingRetiredRanges || [];
	allocator._pendingRetiredRanges = coalesceFreeRanges(
		[...pending, { offset, length }],
		allocator.cursor
	);
	allocator._needsComplementRefresh = true;
	return true;
}

function promote(allocator) {
	const pending = allocator._pendingRetiredRanges || [];
	if (!pending.length) return { promoted: false, ranges: 0 };
	if (allocator.db.pager?.isBatching === true || allocator.db._insideWaitForIdle !== true) {
		return { promoted: false, deferred: true, ranges: pending.length };
	}

	allocator._pendingRetiredRanges = [];
	const report = allocator.db.verify();
	if (!report?.ok) return reject(allocator, pending, report);
	const complement = report.free || [];
	const eligible = pending.filter(range => isCovered(range, complement));
	const rejected = pending.filter(range => !isCovered(range, complement));

	if (rejected.length) {
		allocator.rejectedRetiredRanges.push(...rejected.map(range => ({
			...range,
			reason: 'still-reachable-at-promotion'
		})));
	}
	if (!eligible.length) return { promoted: false, rejected: rejected.length };

	allocator.freeList = coalesceFreeRanges(
		[...allocator.freeList, ...eligible],
		allocator.cursor
	);
	cursorState.absorbTrailingGaps(allocator);
	cursorState.flush(allocator);
	allocator._freeListDirty = true;
	allocator._needsComplementRefresh = false;
	persistence.schedule(allocator);
	return {
		promoted: true,
		ranges: eligible.length,
		rejected: rejected.length
	};
}

function isCovered(range, complement) {
	return complement.some(free => (
		free.offset <= range.offset
		&& free.offset + free.length >= range.offset + range.length
	));
}

function reject(allocator, pending, report) {
	allocator.rejectedRetiredRanges.push(...pending.map(range => ({
		...range,
		reason: 'verification-failed-at-promotion'
	})));
	allocator.reuseVerification = {
		state: 'retirement-promotion-verification-failed',
		ok: false,
		errors: report?.errors || [{ reason: 'missing-verification-report' }],
		checkedAt: Date.now()
	};
	return { promoted: false, rejected: pending.length, report };
}

module.exports = {
	promote,
	queue
};
