// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chamber Six — Grand Hall of Return. The finale: a pillared hall, five sparks
 * in a wide ring, three wisps circling the key at the center. Gather all,
 * take the key, and enter the great gate.
 */
export const CHAMBER_SIX = Object.freeze({
	name: 'Grand Hall of Return',
	spawn: Object.freeze({ x: 300, y: 420 }),
	walls: Object.freeze([
		Object.freeze({ x: 90, y: 90, width: 40, height: 40 }),
		Object.freeze({ x: 510, y: 90, width: 40, height: 40 }),
		Object.freeze({ x: 90, y: 350, width: 40, height: 40 }),
		Object.freeze({ x: 510, y: 350, width: 40, height: 40 }),
		Object.freeze({ x: 300, y: 200, width: 40, height: 40 })
	]),
	sparks: Object.freeze([
		Object.freeze({ x: 60, y: 60 }),
		Object.freeze({ x: 560, y: 60 }),
		Object.freeze({ x: 60, y: 380 }),
		Object.freeze({ x: 560, y: 380 }),
		Object.freeze({ x: 300, y: 60 })
	]),
	key: Object.freeze({ x: 300, y: 300 }),
	hazards: Object.freeze([
		Object.freeze({ x: 200, y: 270, width: 48, height: 48, phase: 1 }),
		Object.freeze({ x: 392, y: 270, width: 48, height: 48, phase: 3 }),
		Object.freeze({ x: 296, y: 140, width: 48, height: 48, phase: 5 })
	]),
	portal: Object.freeze({ x: 299, y: 16, width: 42, height: 68 })
});
