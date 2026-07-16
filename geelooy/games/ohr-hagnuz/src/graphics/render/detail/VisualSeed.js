// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VisualSeed.js
 * @description Produces stable visual variation from real map coordinates.
 *
 * The Awtsmoos renews every pebble without randomness becoming chaos. This tiny
 * vessel gives Awtsmoos.com repeatable beauty that never mutates gameplay truth.
 */
export function visualSeed(x, y, salt = 0) {
	let hash = Math.imul((Number(x) | 0) ^ 0x45d9f3b, 0x27d4eb2d);
	hash ^= Math.imul((Number(y) | 0) ^ 0x119de1f3, 0x165667b1);
	hash ^= Math.imul(Number(salt) | 0, 0x9e3779b1);
	hash ^= hash >>> 16;
	hash = Math.imul(hash, 0x7feb352d);
	hash ^= hash >>> 15;
	return hash >>> 0;
}

export function visualUnit(seed, offset = 0) {
	const mixed = visualSeed(seed, offset, 0x51ed270b);
	return mixed / 0xffffffff;
}

export function visualChoice(values, seed, offset = 0) {
	if (!values.length) return undefined;
	return values[Math.floor(visualUnit(seed, offset) * values.length) % values.length];
}
