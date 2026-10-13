// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chamber Five — Gauntlet of Shadows. A forced corridor of wisps: the sparks
 * lie along the only path, so courage (not exploration) is the lesson.
 * Wisps are spaced with safe pockets between them — fair, never cheap.
 */
export const CHAMBER_FIVE = Object.freeze({
	name: 'Gauntlet of Shadows',
	spawn: Object.freeze({ x: 40, y: 220 }),
	walls: Object.freeze([
		Object.freeze({ x: 0, y: 120, width: 640, height: 24 }),
		Object.freeze({ x: 0, y: 336, width: 640, height: 24 }),
		Object.freeze({ x: 200, y: 144, width: 24, height: 100 }),
		Object.freeze({ x: 400, y: 236, width: 24, height: 100 })
	]),
	sparks: Object.freeze([
		Object.freeze({ x: 140, y: 230 }),
		Object.freeze({ x: 300, y: 230 }),
		Object.freeze({ x: 480, y: 230 })
	]),
	key: Object.freeze({ x: 560, y: 230 }),
	hazards: Object.freeze([
		Object.freeze({ x: 230, y: 216, width: 48, height: 48, phase: 0 }),
		Object.freeze({ x: 340, y: 216, width: 48, height: 48, phase: 2 }),
		Object.freeze({ x: 440, y: 216, width: 40, height: 40, phase: 4 })
	]),
	portal: Object.freeze({ x: 590, y: 216, width: 42, height: 68 })
});
