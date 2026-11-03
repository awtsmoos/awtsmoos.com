// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file core/allocator/freeSpaceOps.js
 * @chapter Verified Hollows Are Reused Without Rejudging Pure Growth Forever
 * @description Reuses trusted gaps and requests a whole-graph court only when
 * discovery is still needed or ownership has actually been retired.
 *
 * Db-phase2: when the gated free list cannot serve in verified mode,
 * allocation falls to the provenance pools (rangeTrust.js) — deferred
 * complement spill first, then ranges this process freed while the
 * gate was closed — each candidate re-validated locally at reuse time.
 * A free() the gate cannot yet judge is recorded in BOTH the durable
 * pending ledger and the session pool, so the space is reusable this
 * session without waiting for the whole-graph walk, and is never lost
 * if the process dies first.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const insertFreeRange = coalesceFreeRanges.insertFreeRange;
const { bumpFreeListVersion } = require('./freeListVersion.js');
const chooseFreeRange = require('./freeRangeSelection.js');
const { ensureVerified, markTrusted } = require('./verifiedReuseGate.js');
const cursorState = require('./cursorState.js');
const persistence = require('./freeListPersistence.js');
const retirementQueue = require('./retirementQueue.js');
const pendingFreeList = require('./pendingFreeList.js');
const rangeTrust = require('./rangeTrust.js');
const { hasCompleteComplement, trustAllocation, requestInitialComplement } = require('./complementTrust.js');

function allocate(allocator, size) {
	if (allocator.cursor === 0) cursorState.initialize(allocator);
	if (allocator.legacySuperblockless && allocator.cursor < cursorState.getPhysicalSize(allocator)) {
		allocator.cursor = cursorState.getPhysicalSize(allocator);
	}
	if (size <= 0) return { offset: 0, length: 0 };
	const completeBefore = hasCompleteComplement(allocator);
	if (canReuse(allocator)) {
		// Engine-fix 2026-10-20 (E1/E2): the list stays sorted + coalesced
		// incrementally; no per-allocate full coalesce/copy (~100 ms/call).
		const selected = chooseFreeRange(
			allocator.freeList,
			size,
			Number(allocator.db.options?.minimumFreeFragment || 64)
		);
		if (selected) {
			bumpFreeListVersion(allocator);
			trustAllocation(allocator, completeBefore);
			requestInitialComplement(allocator, completeBefore);
			persistence.schedule(allocator);
			return selected.location;
		}
	}
	if (allocator.db.options?.reuseFreedSpace === 'verified') {
		// Db-phase2: provenance pools serve without the whole-graph
		// gate — complement-deferred spill, then this session's frees.
		// Every candidate is re-validated at reuse (rangeTrust.js); a
		// refused candidate is quarantined, never handed out.
		const proven = rangeTrust.takeProvenRange(allocator, size);
		if (proven) {
			requestInitialComplement(allocator, completeBefore);
			return proven;
		}
	}
	const location = { offset: allocator.cursor, length: size };
	allocator.cursor += size;
	requestInitialComplement(allocator, completeBefore);
	return location;
}

function free(allocator, offset, length) {
	if (allocator.cursor === 0) cursorState.initialize(allocator);
	if (!validLocalRange(allocator, offset, length)) return false;
	const mode = allocator.db.options?.reuseFreedSpace;
	if (mode === 'verified' && !ensureVerified(allocator)) {
		// Db-hardening: record the free as pending; never drop it.
		// Db-phase2: the same range also enters the session pool, so it
		// can serve this process's allocations (after per-range
		// validation) without waiting for a successful verify.
		rangeTrust.recordSessionFree(allocator, offset, length);
		return pendingFreeList.record(allocator, offset, length);
	}
	if (allocator.db.pager?.isBatching === true) {
		// Engine-fix 2026-10-20 (E5): verified mode used to DROP the range
		// here and rediscover it via a full verify() at idle; queue it.
		return retirementQueue.queue(allocator, offset, length);
	}
	adoptRange(allocator, offset, length);
	return true;
}

function adoptRange(allocator, offset, length) {
	if (offset + length === allocator.cursor) {
		allocator.cursor = offset;
		cursorState.absorbTrailingGaps(allocator);
		cursorState.flush(allocator);
	} else {
		allocator.freeList = insertFreeRange(
			allocator.freeList,
			{ offset, length },
			allocator.cursor
		);
		bumpFreeListVersion(allocator);
	}
	if (allocator.db.options?.reuseFreedSpace === 'verified') {
		markTrusted(allocator, 'verified-local-free');
	}
	// Engine-fix 2026-10-20 (E4): a tracked local free no longer requests
	// a complement refresh; refresh is growth-gated (reachableComplement).
	persistence.schedule(allocator);
}

function releasePointer(allocator, pointer) {
	if (!isReuseEnabled(allocator) || !pointer) return false;
	const Pointer = require('../../utils/pointer/crown.js');
	const constants = require('../../constants.js');
	const decoded = Buffer.isBuffer(pointer) ? Pointer.decode(pointer) : pointer;
	if (!decoded || decoded.type === constants.VAL_TYPE.ANCHOR) return false;
	return free(allocator, decoded.offset, decoded.length);
}

function isReuseEnabled(allocator) {
	const mode = allocator.db.options?.reuseFreedSpace;
	return mode === true || mode === 'verified';
}

function canReuse(allocator) {
	const mode = allocator.db.options?.reuseFreedSpace;
	if (mode === true) return true;
	return mode === 'verified' ? ensureVerified(allocator) : false;
}

function validLocalRange(allocator, offset, length) {
	return Number.isSafeInteger(offset)
		&& Number.isSafeInteger(length)
		&& length > 0
		&& offset >= 64
		&& offset + length <= allocator.cursor;
}
module.exports = { allocate, canReuse, free, isReuseEnabled, releasePointer };
