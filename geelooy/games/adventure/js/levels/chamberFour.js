// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chamber Four — Maze of Echoes. Winding half-walls teach deliberate routing:
 * every spark sits behind a choice of two open corridors, never a dead trap.
 */
export const CHAMBER_FOUR = Object.freeze({
	name: 'Maze of Echoes',
	spawn: Object.freeze({ x: 40, y: 400 }),
	walls: Object.freeze([
		Object.freeze({ x: 110, y: 0, width: 24, height: 280 }),
		Object.freeze({ x: 110, y: 340, width: 24, height: 140 }),
		Object.freeze({ x: 240, y: 120, width: 24, height: 360 }),
		Object.freeze({ x: 240, y: 120, width: 170, height: 24 }),
		Object.freeze({ x: 410, y: 240, width: 24, height: 240 }),
		Object.freeze({ x: 500, y: 80, width: 24, height: 220 })
	]),
	sparks: Object.freeze([
		Object.freeze({ x: 170, y: 60 }),
		Object.freeze({ x: 320, y: 420 }),
		Object.freeze({ x: 470, y: 60 }),
		Object.freeze({ x: 560, y: 400 })
	]),
	key: Object.freeze({ x: 320, y: 180 }),
	hazards: Object.freeze([
		Object.freeze({ x: 170, y: 300, width: 44, height: 44, phase: 1 }),
		Object.freeze({ x: 460, y: 340, width: 44, height: 44, phase: 3 })
	]),
	portal: Object.freeze({ x: 576, y: 20, width: 42, height: 68 })
});
