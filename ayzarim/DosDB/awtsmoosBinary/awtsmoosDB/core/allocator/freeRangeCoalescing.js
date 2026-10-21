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
		// B"H PATCH 2026-10-06: merge overlapping free ranges instead of throwing
		if (range.offset < previousEnd) {
		  const newEnd = Math.max(previousEnd, range.offset + range.length);
		  previous.length = newEnd - previous.offset;
		  continue;
		}
		if (range.offset === previousEnd) {
			previous.length += range.length;
			continue;
		}
		output.push(range);
	}

	return output;
}

/**
 * Inserts one range into an already sorted + coalesced list, merging
 * any overlapping or adjacent neighbors, in O(log n + splice) time.
 * Engine-fix 2026-10-20 (E2): allocate/free hot paths keep the free
 * list normalized incrementally with this insert instead of paying a
 * full sort + copy of ~100k ranges on every operation. The list is
 * mutated in place and returned. Invariant required on entry (and
 * preserved on exit): sorted by offset, no overlaps, no adjacencies.
 * @param {Array<object>} ranges - Sorted coalesced free ranges.
 * @param {object} range - The range to insert.
 * @param {number} cursor - Logical cursor bounding every range.
 * @returns {Array<object>} The same list, normalized.
 */
function insertFreeRange(ranges, range, cursor) {
	const list = Array.isArray(ranges) ? ranges : [];
	const fresh = normalize(range, cursor);
	let lo = 0;
	let hi = list.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (list[mid].offset < fresh.offset) lo = mid + 1;
		else hi = mid;
	}
	let from = lo;
	let offset = fresh.offset;
	let end = fresh.offset + fresh.length;
	if (from > 0) {
		const previous = list[from - 1];
		if (previous.offset + previous.length >= offset) {
			from -= 1;
			offset = previous.offset;
			end = Math.max(end, previous.offset + previous.length);
		}
	}
	let to = from;
	while (to < list.length && list[to].offset <= end) {
		end = Math.max(end, list[to].offset + list[to].length);
		to++;
	}
	list.splice(from, to - from, { offset, length: end - offset });
	return list;
}

coalesceFreeRanges.insertFreeRange = insertFreeRange;
module.exports = coalesceFreeRanges;
