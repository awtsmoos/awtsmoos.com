// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/freeSpaceOps.js
 * @chapter Former Chambers Wait Until The Outer Generation Is Fully Linked
 * @description
 * Reuses verified or locally trusted gaps while quarantining every range retired
 * during an active pager generation. Verified mode adopts the complete reachable
 * complement; legacy reuse promotes only ranges independently confirmed free at
 * outer idle. The Awtsmoos never lets a writer reuse its own unfinished shadow.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const chooseFreeRange = require('./freeRangeSelection.js');
const { ensureVerified, markTrusted } = require('./verifiedReuseGate.js');
const cursorState = require('./cursorState.js');
const persistence = require('./freeListPersistence.js');
const retirementQueue = require('./retirementQueue.js');

function allocate(allocator, size) {
	if (allocator.cursor === 0) cursorState.initialize(allocator);
	if (allocator.legacySuperblockless && allocator.cursor < cursorState.getPhysicalSize(allocator)) {
		allocator.cursor = cursorState.getPhysicalSize(allocator);
	}
	if (size <= 0) return { offset: 0, length: 0 };
	if (canReuse(allocator)) {
		allocator.freeList = coalesceFreeRanges(allocator.freeList, allocator.cursor);
		const selected = chooseFreeRange(
			allocator.freeList,
			size,
			Number(allocator.db.options?.minimumFreeFragment || 64)
		);
		if (selected) {
			allocator.freeList = selected.ranges.sort((left, right) => left.offset - right.offset);
			trustLocalChange(allocator, 'verified-after-allocation');
			markComplementRefresh(allocator);
			persistence.schedule(allocator);
			return selected.location;
		}
	}
	const location = { offset: allocator.cursor, length: size };
	allocator.cursor += size;
	markComplementRefresh(allocator);
	return location;
}

function free(allocator, offset, length) {
	if (allocator.cursor === 0) cursorState.initialize(allocator);
	if (!validLocalRange(allocator, offset, length)) return false;
	const mode = allocator.db.options?.reuseFreedSpace;
	if (mode === 'verified' && !ensureVerified(allocator)) return false;
	if (allocator.db.pager?.isBatching === true) {
		if (mode === 'verified') {
			allocator._needsComplementRefresh = true;
			return true;
		}
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
		allocator.freeList = coalesceFreeRanges(
			[...allocator.freeList, { offset, length }],
			allocator.cursor
		);
	}
	trustLocalChange(allocator, 'verified-local-free');
	markComplementRefresh(allocator);
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

function trustLocalChange(allocator, state) {
	if (allocator.db.options?.reuseFreedSpace === 'verified') markTrusted(allocator, state);
}

function markComplementRefresh(allocator) {
	if (!allocator._savingFreeList) allocator._needsComplementRefresh = true;
}

module.exports = {
	allocate,
	canReuse,
	free,
	isReuseEnabled,
	releasePointer
};
