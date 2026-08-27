// B"H

/**
 * @file core/allocator/freeRangeCoalescing.js
 * @chapter Mercy Joins Neighbors But Never Confuses Owners
 * @description
 * Normalizes adjacent free ranges while rejecting overlap, unsafe integers,
 * superblock claims, and ranges beyond the logical cursor.
 */

function invalid(message, range) {
	const error = new Error(`B"H invalid free range: ${message}`);
	error.code = 'AWTSMOOS_DB_INVALID_FREE_RANGE';
	error.range = range;
	return error;
}

function normalize(range, cursor) {
	const offset = Number(range && range.offset);
	const length = Number(range && range.length);
	if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length)) {
		throw invalid('offset and length must be safe integers', range);
	}
	if (offset < 64 || length <= 0) throw invalid('range enters metadata or has no length', range);
	if (offset + length > cursor) throw invalid('range exceeds the logical cursor', range);
	return { offset, length };
}

function coalesceFreeRanges(ranges, cursor) {
	const sorted = (Array.isArray(ranges) ? ranges : [])
		.map(range => normalize(range, cursor))
		.sort((left, right) => left.offset - right.offset || left.length - right.length);
	const output = [];

	for (const range of sorted) {
		const previous = output[output.length - 1];
		if (!previous) {
			output.push(range);
			continue;
		}
		const previousEnd = previous.offset + previous.length;
		if (range.offset < previousEnd) throw invalid('overlapping ownership claims', range);
		if (range.offset === previousEnd) {
			previous.length += range.length;
			continue;
		}
		output.push(range);
	}

	return output;
}

module.exports = coalesceFreeRanges;
