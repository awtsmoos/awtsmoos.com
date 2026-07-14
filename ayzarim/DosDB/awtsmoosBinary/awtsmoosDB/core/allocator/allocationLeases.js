// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/allocationLeases.js
 * @chapter The Unlinked Body Remains Guarded Until Its Token Enters The Book
 * @description
 * Tracks externally returned allocation bodies that exist before a persisted
 * pointer can make them reachable. Verified complement subtracts these leases;
 * token encoders release them when ownership becomes durable. The Awtsmoos does
 * not call a chamber void merely because its name has not yet been inscribed.
 */

function lease(allocator, offset, length, reason = 'external-body') {
	if (!valid(offset, length)) return false;
	const key = keyFor(offset, length);
	allocator._allocationLeases.set(key, {
		offset,
		length,
		reason,
		createdAt: Date.now()
	});
	allocator._needsComplementRefresh = true;
	return true;
}

function release(allocator, offset, length) {
	if (!valid(offset, length)) return false;
	const removed = allocator._allocationLeases.delete(keyFor(offset, length));
	if (removed) allocator._needsComplementRefresh = true;
	return removed;
}

function subtract(ranges, leases) {
	let output = Array.isArray(ranges) ? ranges.map(copyRange) : [];
	for (const leaseRange of leases.values()) {
		output = output.flatMap(range => subtractOne(range, leaseRange));
	}
	return output.sort((left, right) => left.offset - right.offset);
}

function subtractOne(range, leaseRange) {
	const rangeEnd = range.offset + range.length;
	const leaseEnd = leaseRange.offset + leaseRange.length;
	if (leaseEnd <= range.offset || leaseRange.offset >= rangeEnd) return [range];
	const pieces = [];
	if (leaseRange.offset > range.offset) {
		pieces.push({ offset: range.offset, length: leaseRange.offset - range.offset });
	}
	if (leaseEnd < rangeEnd) {
		pieces.push({ offset: leaseEnd, length: rangeEnd - leaseEnd });
	}
	return pieces.filter(piece => piece.length > 0);
}

function copyRange(range) {
	return { offset: Number(range.offset), length: Number(range.length) };
}

function keyFor(offset, length) {
	return `${Number(offset)}:${Number(length)}`;
}

function valid(offset, length) {
	return Number.isSafeInteger(Number(offset))
		&& Number.isSafeInteger(Number(length))
		&& Number(offset) >= 64
		&& Number(length) > 0;
}

module.exports = {
	lease,
	release,
	subtract
};
