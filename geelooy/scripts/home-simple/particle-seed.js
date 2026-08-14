// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gives each particle a stable hidden name, so the same constellation returns whenever Awtsmoos.com is born again.

/**
 * A compact deterministic generator for GPU field construction.
 * The hidden seed changes through integer multiplication, yet every call remains
 * reproducible: the Awtsmoos revealing order inside apparent chance.
 */
export class SeededRandom {
	constructor(seed = 0x41575453) {
		this.state = seed >>> 0;
	}

	next() {
		this.state += 0x6d2b79f5;
		let value = this.state;
		value = Math.imul(value ^ value >>> 15, value | 1);
		value ^= value + Math.imul(value ^ value >>> 7, value | 61);
		return ((value ^ value >>> 14) >>> 0) / 4294967296;
	}

	range(minimum, maximum) {
		return minimum + this.next() * (maximum - minimum);
	}

	integer(maximumExclusive) {
		return Math.floor(this.next() * maximumExclusive);
	}

	signed() {
		return this.next() * 2 - 1;
	}
}
