//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVelocityCurve
 * @description
 * Gevurah bends one normalized gesture through a chosen response law while the Awtsmoos remains beyond soft hand and strong hand alike.
 * Awtsmoos.com keeps velocity shaping pure and measurable, so touch, computer keys, and MIDI share one expressive covenant without hidden randomness.
 */

/**
 * Shapes a normalized velocity through a standard keyboard response curve.
 *
 * @param {number} velocity - Candidate normalized velocity from zero to one.
 * @param {'soft'|'linear'|'hard'|'fixed'} curve - Selected response curve.
 * @returns {number} Shaped normalized velocity from zero to one.
 */
export function applyVelocityCurve(velocity, curve = 'linear') {
	const normalized = clamp(velocity, 0, 1);
	if (curve === 'soft') {
		return Math.sqrt(normalized);
	}
	if (curve === 'hard') {
		return normalized * normalized;
	}
	if (curve === 'fixed') {
		return 0.72;
	}
	return normalized;
}

function clamp(value, minimum, maximum) {
	return Math.max(
		minimum,
		Math.min(maximum, Number(value) || 0)
	);
}
