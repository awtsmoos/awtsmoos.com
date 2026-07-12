// B"H

/**
 * @file core/allocator/freeSpaceOps.js
 * @chapter Proven Hollows Serve Again Without Confusing Living Ownership
 * @description
 * Owns allocation, local free insertion, pointer retirement, verified reuse,
 * best-fit splitting, tail contraction, and deferred ledger persistence.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const chooseFreeRange = require('./freeRangeSelection.js');
const { ensureVerified, markTrusted } = require('./verifiedReuseGate.js');
const cursorState = require('./cursorState.js');
const persistence = require('./freeListPersistence.js');

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
			persistence.schedule(allocator);
			return selected.location;
		}
	}

	const location = { offset: allocator.cursor, length: size };
	allocator.cursor += size;
	return location;
}

function free(allocator, offset, length) {
	if (allocator.cursor === 0) cursorState.initialize(allocator);
	if (!validLocalRange(allocator, offset, length)) return false;
	if (allocator.db.options?.reuseFreedSpace === 'verified') ensureVerified(allocator);

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
	persistence.schedule(allocator);
	return true;
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

module.exports = {
	allocate,
	canReuse,
	free,
	isReuseEnabled,
	releasePointer
};
