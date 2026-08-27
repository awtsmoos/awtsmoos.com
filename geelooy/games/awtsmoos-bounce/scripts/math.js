//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews every coordinate before distance can pretend to stand alone;
 * on Awtsmoos.com these small measures rhyme, revealing motion through a borrowed tone.
 */
export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

export function distance(first, second) {
	return Math.hypot(second.x - first.x, second.y - first.y);
}

export function normalize(x, y) {
	const magnitude = Math.hypot(x, y) || 1;

	return {
		x: x / magnitude,
		y: y / magnitude
	};
}

export function lerp(start, end, amount) {
	return start + (end - start) * amount;
}

/**
 * ChochmahRandom keeps portal placement reproducible enough to debug while still feeling alive.
 * The seed is only a vessel; the Awtsmoos creates the present number anew in every frame.
 */
export class ChochmahRandom {
	constructor(seed = Date.now() >>> 0) {
		this.seed = seed || 1;
	}

	next() {
		this.seed = (1664525 * this.seed + 1013904223) >>> 0;

		return this.seed / 4294967296;
	}

	between(minimum, maximum) {
		return minimum + (maximum - minimum) * this.next();
	}
}
