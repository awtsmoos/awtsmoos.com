// B"H

/**
 * @file core/allocator/cursorState.js
 * @chapter The Boundary Of The Written World Moves Only By Exact Witness
 * @description
 * Owns logical-cursor initialization, legacy detection, durable cursor writes,
 * and repeated absorption of verified gaps touching the file tail.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');

function initialize(allocator) {
	const physicalSize = getPhysicalSize(allocator);
	const header = allocator.pager.readExact(0, 8);
	if (!header || header.length !== 8) {
		allocator.cursor = 64;
		flush(allocator);
		return;
	}
	const cursor = Number(header.readBigUInt64BE(0));
	if (isImpossible(cursor, physicalSize)) {
		allocator.legacySuperblockless = true;
		allocator.cursor = Math.max(physicalSize, 0);
		return;
	}
	allocator.cursor = Number.isFinite(cursor) && cursor >= 64 ? cursor : 64;
}

function getPhysicalSize(allocator) {
	const size = Number(allocator.pager.currentFileSize || 0);
	return Number.isFinite(size) && size >= 0 ? size : 0;
}

function isImpossible(cursor, physicalSize) {
	if (!Number.isSafeInteger(cursor)) return true;
	if (cursor < 64 || physicalSize <= 0) return false;
	const growthLimit = Math.max(physicalSize + 1024 * 1024 * 1024, physicalSize * 4);
	return cursor > growthLimit;
}

function flush(allocator) {
	if (allocator.legacySuperblockless || allocator.cursor < 64) return;
	const buffer = Buffer.allocUnsafe(8);
	buffer.writeBigUInt64BE(BigInt(allocator.cursor), 0);
	allocator.pager.writeExact(0, buffer);
}

function merge(allocator) {
	allocator.freeList = coalesceFreeRanges(allocator.freeList, allocator.cursor);
}

function absorbTrailingGaps(allocator) {
	merge(allocator);
	while (allocator.freeList.length) {
		const gap = allocator.freeList[allocator.freeList.length - 1];
		if (gap.offset + gap.length !== allocator.cursor) break;
		allocator.cursor = gap.offset;
		allocator.freeList.pop();
	}
}

module.exports = {
	absorbTrailingGaps,
	flush,
	getPhysicalSize,
	initialize,
	isImpossible,
	merge
};
