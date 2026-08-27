// B"H

/**
 * @file core/allocator/freeRangeSelection.js
 * @chapter The Smallest Fitting Chamber Opens First
 * @description
 * Chooses best fit while preferring exact fits and avoiding tiny remainders
 * when another verified chamber can satisfy the same request more cleanly.
 */

function chooseFreeRange(ranges, size, minimumFragment = 64) {
	const candidates = [];
	for (let index = 0; index < ranges.length; index++) {
		const range = ranges[index];
		if (range.length < size) continue;
		const remainder = range.length - size;
		candidates.push({
			index,
			range,
			remainder,
			fragmentPenalty: remainder > 0 && remainder < minimumFragment ? 1 : 0
		});
	}

	candidates.sort((left, right) => {
		return left.fragmentPenalty - right.fragmentPenalty
			|| left.range.length - right.range.length
			|| left.range.offset - right.range.offset;
	});

	const chosen = candidates[0];
	if (!chosen) return null;
	const next = ranges.map(range => ({ ...range }));
	const selected = next[chosen.index];
	const location = { offset: selected.offset, length: size };
	selected.offset += size;
	selected.length -= size;
	if (selected.length === 0) next.splice(chosen.index, 1);
	return { location, ranges: next };
}

module.exports = chooseFreeRange;
