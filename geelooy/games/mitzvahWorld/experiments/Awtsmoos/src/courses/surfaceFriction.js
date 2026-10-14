// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file surfaceFriction.js
 * @description Realistic per-surface grip for course platforms.
 * Grass holds the runner, stone holds nearly as well, wood slips a little,
 * and ice keeps momentum — low acceleration to start, almost no deceleration
 * to stop. The Awtsmoos lets every surface speak its own measure of grip.
 */

/** Frozen surface physics table. accelScale/decelScale multiply base accel/decel. */
export const COURSE_SURFACES = Object.freeze({
	grass: Object.freeze({ accelScale: 1.0, decelScale: 1.0, label: 'Grass' }),
	stone: Object.freeze({ accelScale: 0.95, decelScale: 0.9, label: 'Stone' }),
	wood: Object.freeze({ accelScale: 0.85, decelScale: 0.8, label: 'Wood' }),
	ice: Object.freeze({ accelScale: 0.35, decelScale: 0.12, label: 'Ice' })
});

const DEFAULT_SURFACE = COURSE_SURFACES.grass;

/**
 * Resolves friction scales for a surface id, defaulting to grass.
 * @param {string} surface Surface id.
 * @returns {{accelScale:number,decelScale:number,label:string}} Friction scales.
 */
export function frictionFor(surface) {
	return COURSE_SURFACES[surface] || DEFAULT_SURFACE;
}

/**
 * Applies surface friction to base acceleration values.
 * @param {number} acceleration Base acceleration.
 * @param {number} deceleration Base deceleration.
 * @param {string} surface Surface id.
 * @returns {{acceleration:number,deceleration:number}} Scaled values.
 */
export function applySurfaceFriction(acceleration, deceleration, surface) {
	const friction = frictionFor(surface);
	return {
		acceleration: acceleration * friction.accelScale,
		deceleration: deceleration * friction.decelScale
	};
}
