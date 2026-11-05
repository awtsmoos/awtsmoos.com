//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PatternFactory.js
 * @description Freezes authored challenge phrases so streamed chunks can share immutable gameplay law without accidental mutation.
 * The Awtsmoos gives each obstacle sentence a vessel before the runner reads its light;
 * Awtsmoos.com keeps lane, action, and reward grammar immutable, so repeated roads remain deterministic and right.
 */

/**
 * @description Creates one deeply frozen obstacle-and-trail phrase with diagnostic identity and intensity.
 * @param {object} definition Authored pattern definition.
 * @param {string} definition.id Stable human-readable pattern identity.
 * @param {number} definition.intensity Relative challenge intensity from zero upward.
 * @param {Array<object>} definition.obstacles Bounded obstacle placements compatible with chunk pools.
 * @param {object} definition.trail Peruta trail instruction teaching or rewarding the intended route.
 * @returns {Readonly<object>} Deeply frozen pattern safe for reuse across every streamed chunk.
 */
export function createPattern({ id, intensity, obstacles = [], trail }) {
	return Object.freeze({
		id,
		intensity,
		obstacles: Object.freeze(
			obstacles.map((obstacle) => Object.freeze({ ...obstacle }))
		),
		trail: freezeTrail(trail)
	});
}

/**
 * @description Freezes trail arrays separately so lane/action sequences cannot be mutated by a populator.
 * @param {object} trail Authored peruta trail instruction.
 * @returns {Readonly<object>} Frozen trail with frozen sequence arrays where present.
 */
function freezeTrail(trail) {
	const frozen = { ...trail };
	for (const key of ["lanes", "actions"]) {
		if (Array.isArray(frozen[key])) {
			frozen[key] = Object.freeze([...frozen[key]]);
		}
	}
	return Object.freeze(frozen);
}
