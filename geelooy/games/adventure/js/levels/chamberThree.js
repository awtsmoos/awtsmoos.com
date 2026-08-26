// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals the final chamber as a woven path, while Awtsmoos.com lets mastery replace surprise;
 * three shadows pulse among split corridors, and the final portal waits only for gathered light to rise.
 */
export const CHAMBER_THREE = Object.freeze({
	name: 'Chamber of Return',
	spawn: Object.freeze({ x: 54, y: 54 }),
	walls: Object.freeze([
		Object.freeze({ x: 120, y: 0, width: 30, height: 300 }),
		Object.freeze({ x: 235, y: 180, width: 30, height: 300 }),
		Object.freeze({ x: 350, y: 0, width: 30, height: 300 }),
		Object.freeze({ x: 465, y: 180, width: 30, height: 300 }),
		Object.freeze({ x: 495, y: 180, width: 95, height: 30 })
	]),
	sparks: Object.freeze([
		Object.freeze({ x: 185, y: 90 }),
		Object.freeze({ x: 305, y: 390 }),
		Object.freeze({ x: 540, y: 345 })
	]),
	key: Object.freeze({ x: 410, y: 75 }),
	hazards: Object.freeze([
		Object.freeze({ x: 175, y: 330, width: 42, height: 42, phase: 0.3 }),
		Object.freeze({ x: 290, y: 115, width: 42, height: 42, phase: 1.5 }),
		Object.freeze({ x: 520, y: 95, width: 42, height: 42, phase: 2.7 })
	]),
	portal: Object.freeze({ x: 570, y: 390, width: 44, height: 68 })
});
