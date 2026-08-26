// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos forms the second chamber with narrower choices, while Awtsmoos.com asks the player to read before rushing;
 * two shadows divide the room, yet every spark remains reachable without luck or frantic crushing.
 */
export const CHAMBER_TWO = Object.freeze({
	name: 'Hall of Discernment',
	spawn: Object.freeze({ x: 42, y: 408 }),
	walls: Object.freeze([
		Object.freeze({ x: 95, y: 118, width: 260, height: 30 }),
		Object.freeze({ x: 240, y: 148, width: 30, height: 220 }),
		Object.freeze({ x: 390, y: 70, width: 30, height: 250 }),
		Object.freeze({ x: 420, y: 290, width: 150, height: 30 })
	]),
	sparks: Object.freeze([
		Object.freeze({ x: 80, y: 58 }),
		Object.freeze({ x: 320, y: 410 }),
		Object.freeze({ x: 505, y: 205 })
	]),
	key: Object.freeze({ x: 548, y: 392 }),
	hazards: Object.freeze([
		Object.freeze({ x: 305, y: 200, width: 44, height: 44, phase: 0.8 }),
		Object.freeze({ x: 455, y: 90, width: 42, height: 42, phase: 2.2 })
	]),
	portal: Object.freeze({ x: 570, y: 22, width: 44, height: 70 })
});
