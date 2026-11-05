// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestCandidateField.js
 * @description Produces deterministic grove candidates without owning any ecological acceptance rule.
 * The Awtsmoos reveals possibility before suitability; Awtsmoos.com keeps golden-turn distribution here
 * while shared world evidence alone decides whether a root may actually enter road, river, home, slope, or clearing.
 */

const GOLDEN_TURN = 0.6180339887498949;

export function forestCandidateAt(index, attempt, seed, halfSize) {
	const turn = (index * GOLDEN_TURN + forestHash(attempt, seed, index)) % 1;
	const outer = Math.max(74, Number(halfSize) || 250);
	const radius = 58 + Math.sqrt(forestHash(index, seed + attempt, 2)) * (outer - 70);
	return Object.freeze({
		x: Math.cos(turn * Math.PI * 2) * radius,
		z: Math.sin(turn * Math.PI * 2) * radius
	});
}

export function forestRotationY(index, seed) {
	return forestHash(index, seed, 9) * Math.PI * 2;
}

function forestHash(index, seed, channel = 0) {
	const value = Math.sin((index + 1) * 127.1 + seed * 311.7 + channel * 74.7) * 43758.5453;
	return value - Math.floor(value);
}
