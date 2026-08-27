// B"H

/**
 * @file core/verifier/rangeLedger.js
 * @chapter Every Byte Must Answer For Its Name
 * @description
 * Records reachable allocations, rejects impossible bounds, exposes overlapping
 * ownership, and derives the exact complement that may later be considered free.
 */

class RangeLedger {
	constructor(limit, errors) {
		this.limit = Number(limit || 0);
		this.errors = errors;
		this.ranges = [];
	}

	add(pointer, tag) {
		if (!pointer || !Number.isSafeInteger(pointer.offset) || !Number.isSafeInteger(pointer.length)) {
			this.errors.push({ tag, reason: 'pointer-not-safe-integer', ptr: pointer });
			return false;
		}

		if (pointer.offset < 0 || pointer.length < 0 || pointer.offset + pointer.length > this.limit) {
			this.errors.push({ tag, reason: 'pointer-out-of-bounds', ptr: pointer });
			return false;
		}

		if (pointer.length > 0) {
			this.ranges.push({ offset: pointer.offset, length: pointer.length, tag });
		}
		return true;
	}

	finalize() {
		const sorted = this.ranges
			.filter(range => range.length > 0)
			.sort((left, right) => left.offset - right.offset || left.length - right.length);
		const merged = [];

		for (const range of sorted) {
			const last = merged[merged.length - 1];
			if (!last || last.offset + last.length < range.offset) {
				merged.push({ offset: range.offset, length: range.length, tag: range.tag });
				continue;
			}

			if (last.offset + last.length > range.offset) {
				this.errors.push({
					reason: 'reachable-range-overlap',
					left: { offset: last.offset, length: last.length, tag: last.tag },
					right: range
				});
			}

			const end = Math.max(last.offset + last.length, range.offset + range.length);
			last.length = end - last.offset;
		}

		return merged.map(({ offset, length }) => ({ offset, length }));
	}

	complement(merged, start = 64) {
		const free = [];
		let cursor = start;

		for (const range of merged) {
			if (range.offset > cursor) free.push({ offset: cursor, length: range.offset - cursor });
			cursor = Math.max(cursor, range.offset + range.length);
		}

		if (cursor < this.limit) free.push({ offset: cursor, length: this.limit - cursor });
		return free.filter(range => range.length > 0);
	}
}

module.exports = RangeLedger;
