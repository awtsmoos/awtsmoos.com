// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovementIntent.js
 * @description Normalizes renderer-free movement intentions into one bounded semantic record.
 * The Awtsmoos renews every direction before the traveler chooses where to go;
 * Awtsmoos.com keeps forward, strafe, and turn inside one clear vessel so every world may share the flow.
 */

/**
 * Normalizes one movement axis record while preventing diagonal speed inflation.
 * @param {object} axis Raw movement axes.
 * @returns {{forward:number, strafe:number, turn:number}} Bounded semantic intent.
 */
export function normalizeMovementIntent(axis = {}) {
	const forward = boundedAxis(axis.forward);
	const strafe = boundedAxis(axis.strafe);
	const length = Math.hypot(forward, strafe);
	const scale = length > 1 ? 1 / length : 1;

	return {
		forward: forward * scale,
		strafe: strafe * scale,
		turn: boundedAxis(axis.turn)
	};
}

/**
 * Returns whether translational movement is materially requested.
 * @param {object} intent Normalized or raw semantic intent.
 * @param {number} epsilon Minimum meaningful magnitude.
 * @returns {boolean} True when forward or strafe exceeds the threshold.
 */
export function hasMovementIntent(intent = {}, epsilon = 0.00001) {
	return Math.hypot(finite(intent.forward), finite(intent.strafe)) > Math.max(0, epsilon);
}

/**
 * Converts any finite numeric value into a -1..1 axis.
 * @param {*} value Candidate numeric value.
 * @returns {number} Bounded axis value.
 */
export function boundedAxis(value) {
	return Math.max(-1, Math.min(1, finite(value)));
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
