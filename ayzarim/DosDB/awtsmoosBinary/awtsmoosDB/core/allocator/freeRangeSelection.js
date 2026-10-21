// B"H

/**
 * @file core/allocator/freeRangeSelection.js
 * @chapter The Smallest Fitting Chamber Opens First
 * @description
 * Chooses best fit while preferring exact fits and avoiding tiny remainders
 * when another verified chamber can satisfy the same request more cleanly.
 */

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

module.exports = chooseFreeRange;
