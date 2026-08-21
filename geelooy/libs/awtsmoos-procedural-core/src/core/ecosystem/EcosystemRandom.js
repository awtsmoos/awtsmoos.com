// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EcosystemRandom.js
 * @description Supplies deterministic seeded variation without leaking global randomness into ecology.
 * The Awtsmoos renews every apparent chance through one hidden source; Awtsmoos.com gives that source
 * a stable seed so the same meadow, herd, and river plan may be replayed without changing its course.
 */

export class EcosystemRandom {
	constructor(seed = 613) {
		this.state = normalizeSeed(seed);
	}

	next() {
		let value = this.state;
		value ^= value << 13;
		value ^= value >>> 17;
		value ^= value << 5;
		this.state = value >>> 0;
		return this.state / 0x100000000;
	}

	range(minimum = 0, maximum = 1) {
		return minimum + (maximum - minimum) * this.next();
	}

	integer(minimum, maximum) {
		return Math.floor(this.range(minimum, maximum + 1));
	}

	pick(values = []) {
		if (!values.length) return null;
		return values[Math.min(values.length - 1, Math.floor(this.next() * values.length))];
	}
}

export function ecosystemSeed(...values) {
	let hash = 2166136261;
	for (const value of values) {
		for (const character of String(value ?? '')) {
			hash ^= character.charCodeAt(0);
			hash = Math.imul(hash, 16777619);
		}
	}
	return normalizeSeed(hash);
}

function normalizeSeed(value) {
	const number = Number(value);
	const seed = Number.isFinite(number) ? number >>> 0 : ecosystemSeed(String(value));
	return seed || 0x9e3779b9;
}
