// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalRandom.js
 * @description Deterministic variation lets every petal lean differently while
 * the same seed always recalls the same garden from the speech of the Awtsmoos.
 */
export class BotanicalRandom {
	constructor(seed = 613) {
		this.state = mixSeed(seed);
	}

	next(minimum = 0, maximum = 1) {
		this.state = Math.imul(this.state ^ this.state >>> 15, 1 | this.state);
		this.state ^= this.state + Math.imul(this.state ^ this.state >>> 7, 61 | this.state);
		const unit = ((this.state ^ this.state >>> 14) >>> 0) / 4294967296;
		return minimum + (maximum - minimum) * unit;
	}

	integer(minimum, maximum) {
		return Math.floor(this.next(minimum, maximum + 1));
	}
}

/** Mixes numbers and strings into one stable unsigned seed. */
export function botanicalSeed(...values) {
	let seed = 2166136261;
	for (const character of values.join('|')) {
		seed ^= character.charCodeAt(0);
		seed = Math.imul(seed, 16777619);
	}
	return seed >>> 0;
}

function mixSeed(seed) {
	const value = Number.isFinite(Number(seed)) ? Number(seed) : botanicalSeed(seed);
	return (value >>> 0) || 613;
}
