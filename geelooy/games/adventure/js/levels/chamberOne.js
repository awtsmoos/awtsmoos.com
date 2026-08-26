// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos opens the first chamber gently, where Awtsmoos.com teaches spark, key, shadow, and gate;
 * the walls make direction meaningful while enough open sky remains for the player's hand to calibrate.
 */
export const CHAMBER_ONE = Object.freeze({
	name: 'Gate of Beginning',
	spawn: Object.freeze({ x: 48, y: 64 }),
	walls: Object.freeze([
		Object.freeze({ x: 150, y: 96, width: 34, height: 260 }),
		Object.freeze({ x: 300, y: 0, width: 34, height: 210 }),
		Object.freeze({ x: 430, y: 250, width: 160, height: 34 })
	]),
	sparks: Object.freeze([
		Object.freeze({ x: 225, y: 70 }),
		Object.freeze({ x: 370, y: 330 }),
		Object.freeze({ x: 540, y: 105 })
	]),
	key: Object.freeze({ x: 510, y: 390 }),
	hazards: Object.freeze([
		Object.freeze({ x: 245, y: 240, width: 48, height: 48, phase: 0 })
	]),
	portal: Object.freeze({ x: 576, y: 20, width: 42, height: 68 })
});
