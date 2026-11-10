// B"H

/**
 * @file core/allocator/freeRangeSelection.js
 * @chapter The Smallest Fitting Chamber Opens First
 * @description
 * Chooses best fit while preferring exact fits and avoiding tiny remainders
 * when another verified chamber can satisfy the same request more cleanly.
 *
 * Two choosers live here. chooseFreeRange is the original linear scan
 * (kept for tests and for callers that hand it a bare list). The live
 * allocate path uses chooseFreeRangeIndexed, which answers the same
 * best-fit question from the allocator's size-sorted index
 * (freeListBySize.js) in O(log n + 32) instead of O(n) — the scan was
 * ~0.4 ms at 48k ranges and ~1 ms at 200k, paid thousands of times per
 * flush, and it grew with every write because the free list only grows
 * as retired structure fragments.
 *
 * The indexed chooser preserves the E1 preference order exactly
 * (fragmentPenalty, then smallest length, then smallest offset) and the
 * same return shape. It verifies the chosen range against the
 * offset-sorted free list before consuming it; if the verification
 * fails (a mutation path bypassed the index), it rebuilds the index
 * from the free list and retries once, then falls back to null (the
 * caller appends at the cursor). A stale index can therefore only cost
 * one rebuild, never a wrong allocation.
 */

const freeListBySize = require('./freeListBySize.js');

function chooseFreeRange(ranges, size, minimumFragment = 64) {
	// Engine-fix 2026-10-20 (E1): single pass, zero list copies. The old
	// implementation collected every fitting range, sorted the candidates,
	// then copied the ENTIRE free list on every allocate — ~40 ms per call
	// at ~100k ranges, paid ~80 times per dictionary put. Preference order
	// is unchanged: fragmentPenalty, then smallest length, then smallest
	// offset (the list is offset-sorted, so the first of equals wins). The
	// chosen range is consumed in place; the remainder keeps its sorted
	// position because it lies strictly inside the original span.
	let bestIndex = -1;
	let bestPenalty = 0;
	let bestLength = 0;
	for (let index = 0; index < ranges.length; index++) {
		const range = ranges[index];
		if (range.length < size) continue;
		if (range.length === size) { bestIndex = index; break; }
		const remainder = range.length - size;
		const penalty = remainder > 0 && remainder < minimumFragment ? 1 : 0;
		if (bestIndex < 0
			|| penalty < bestPenalty
			|| (penalty === bestPenalty && range.length < bestLength)) {
			bestIndex = index;
			bestPenalty = penalty;
			bestLength = range.length;
		}
	}

	if (bestIndex < 0) return null;
	const selected = ranges[bestIndex];
	const location = { offset: selected.offset, length: size };
	selected.offset += size;
	selected.length -= size;
	if (selected.length === 0) ranges.splice(bestIndex, 1);
	return { location, ranges };
}

function binarySearchOffset(list, offset) {
	let lo = 0;
	let hi = list.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (list[mid].offset < offset) lo = mid + 1;
		else hi = mid;
	}
	return lo < list.length && list[lo].offset === offset ? lo : -1;
}

function verifyInFreeList(freeList, range) {
	const idx = binarySearchOffset(freeList, range.offset);
	return idx >= 0 && freeList[idx].length === range.length;
}

function ensureIndex(allocator) {
	if (!allocator._freeBySizeValid || !allocator._freeBySize) {
		allocator._freeBySize = freeListBySize.buildIndex(allocator.freeList);
		allocator._freeBySizeValid = true;
	}
	return allocator._freeBySize;
}

function chooseFreeRangeIndexed(allocator, size, minimumFragment = 64) {
	const freeList = allocator.freeList;
	for (let attempt = 0; attempt < 2; attempt++) {
		const index = ensureIndex(allocator);
		const chosen = freeListBySize.indexFindBest(index, size, minimumFragment);
		if (!chosen) return null;
		if (!verifyInFreeList(freeList, chosen)) {
			allocator._freeBySize = freeListBySize.buildIndex(freeList);
			allocator._freeBySizeValid = true;
			continue;
		}
		const idx = binarySearchOffset(freeList, chosen.offset);
		if (idx < 0 || freeList[idx].length !== chosen.length) {
			allocator._freeBySize = freeListBySize.buildIndex(freeList);
			allocator._freeBySizeValid = true;
			continue;
		}
		freeListBySize.indexRemove(index, chosen);
		const location = { offset: chosen.offset, length: size };
		const remainderLength = chosen.length - size;
		if (remainderLength === 0) {
			freeList.splice(idx, 1);
		} else {
			const remainder = { offset: chosen.offset + size, length: remainderLength };
			freeList.splice(idx, 1, remainder);
			freeListBySize.indexInsert(index, remainder);
		}
		return { location, ranges: freeList };
	}
	return null;
}

module.exports = chooseFreeRange;
module.exports.chooseFreeRangeIndexed = chooseFreeRangeIndexed;
module.exports.chooseFreeRange = chooseFreeRange;
