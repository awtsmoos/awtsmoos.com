// B"H

/**
 * @file core/allocator/retiredRangeUnion.js
 * @chapter A Confirmed Retired Vessel Joins Any Void Already Known Inside It
 * @description
 * Unions a post-link retired range with trusted local free space. Persisted and
 * untrusted free-list validation remains strict and continues rejecting overlap.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const cursorState = require('./cursorState.js');
const persistence = require('./freeListPersistence.js');
const { ensureVerified, markTrusted } = require('./verifiedReuseGate.js');

function retireRange(allocator, offset, length) {
	if (!validRange(allocator, offset, length)) return false;
	if (allocator.db.options?.reuseFreedSpace === 'verified') ensureVerified(allocator);
	const combined = unionRange(allocator.freeList, { offset, length });
	allocator.freeList = coalesceFreeRanges(combined, allocator.cursor);
	cursorState.absorbTrailingGaps(allocator);
	cursorState.flush(allocator);
	if (allocator.db.options?.reuseFreedSpace === 'verified') {
		markTrusted(allocator, 'verified-retired-union');
	}
	allocator._needsComplementRefresh = true;
	persistence.schedule(allocator);
	return true;
}

function unionRange(ranges, added) {
	let start = added.offset;
	let end = added.offset + added.length;
	const untouched = [];
	for (const range of ranges || []) {
		const rangeEnd = range.offset + range.length;
		if (rangeEnd < start || range.offset > end) {
			untouched.push({ ...range });
			continue;
		}
		start = Math.min(start, range.offset);
		end = Math.max(end, rangeEnd);
	}
	untouched.push({ offset: start, length: end - start });
	return untouched;
}

function validRange(allocator, offset, length) {
	return Number.isSafeInteger(offset)
		&& Number.isSafeInteger(length)
		&& offset >= 64
		&& length > 0
		&& offset + length <= allocator.cursor;
}

module.exports = retireRange;
