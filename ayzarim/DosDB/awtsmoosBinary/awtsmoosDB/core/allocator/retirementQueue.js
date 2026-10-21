// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/retirementQueue.js
 * @chapter A Former Chamber Waits For The Reachability Court
 * @description
 * Quarantines locally retired ranges during an active pager generation. At the
 * outer idle boundary the queued ranges join reusable space. The Awtsmoos thus
 * reveals that absence is real, not merely asserted by a writer still linking
 * replacements.
 *
 * Engine-fix 2026-10-20 (E6): promotion used to run a full db.verify()
 * and intersect the queue with its complement — 4 s at 2,000 records
 * and minutes at migration scale, paid at EVERY idle after any batch.
 * Queued ranges are exact offsets the writer itself retired through
 * free()/releasePointer (the same trust basis as adoptRange's
 * 'verified-local-free'); the queue is in-memory only, a queued range
 * is never handed out before promotion (it is not in the free list),
 * and overlaps are merged by coalescing, so promotion now merges
 * directly and stamps trust. Periodic ground truth remains with the
 * growth-gated complement refresh in reachableComplement.js.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const insertFreeRange = coalesceFreeRanges.insertFreeRange;
const { bumpFreeListVersion } = require('./freeListVersion.js');
const cursorState = require('./cursorState.js');
const persistence = require('./freeListPersistence.js');

function queue(allocator, offset, length) {
	const pending = allocator._pendingRetiredRanges || [];
	allocator._pendingRetiredRanges = insertFreeRange(
		pending,
		{ offset, length },
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
	allocator.freeList = coalesceFreeRanges(
		[...allocator.freeList, ...pending],
		allocator.cursor
	);
	bumpFreeListVersion(allocator);
	cursorState.absorbTrailingGaps(allocator);
	cursorState.flush(allocator);
	allocator._freeListDirty = true;
	// _needsComplementRefresh is NOT cleared here: it also signals
	// untracked churn (notifyRetired) that only a refresh rediscovers;
	// the refresh path owns clearing it. (Engine-fix regression fix.)
	// Inline trust stamp (same fields as the gate's markTrusted; kept
	// here to avoid a circular require on verifiedReuseGate).
	allocator._trustedFreeListVersion = allocator._freeListVersion;
	allocator.reuseVerification = {
		state: 'verified-retirement-promotion',
		ok: true,
		ranges: allocator.freeList.length,
		checkedAt: Date.now()
	};
	persistence.schedule(allocator);
	return {
		promoted: true,
		ranges: pending.length,
		rejected: 0
	};
}

module.exports = {
	promote,
	queue
};
