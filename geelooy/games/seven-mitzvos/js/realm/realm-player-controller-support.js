//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file realm-player-controller-support.js
 * @description
 * The Awtsmoos renews bounded movement through small pure laws beside the traveler;
 * Awtsmoos.com keeps Realm's historical envelope explicit while other worlds may provide wider bounds without forking locomotion.
 * These helpers own no listeners, scene objects, animation state, or domain persistence.
 */
export const DEFAULT_REALM_BOUNDS = Object.freeze({
	minX: -12.5,
	maxX: 12.5,
	minZ: -10.5,
	maxZ: 10.5
});

/** Returns a complete finite bounds record while preserving the historic Realm defaults. */
export function normalizedMovementBounds(bounds = DEFAULT_REALM_BOUNDS) {
	return {
		minX: finiteOr(bounds.minX, DEFAULT_REALM_BOUNDS.minX),
		maxX: finiteOr(bounds.maxX, DEFAULT_REALM_BOUNDS.maxX),
		minZ: finiteOr(bounds.minZ, DEFAULT_REALM_BOUNDS.minZ),
		maxZ: finiteOr(bounds.maxZ, DEFAULT_REALM_BOUNDS.maxZ)
	};
}

/** Reports whether one normalized keyboard key belongs to continuous movement. */
export function isMovementKey(key) {
	return [
		'w',
		'a',
		's',
		'd',
		'arrowup',
		'arrowdown',
		'arrowleft',
		'arrowright'
	].includes(key);
}

/** Constrains one scalar target coordinate to its controller-specific world envelope. */
export function clampMovement(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function finiteOr(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
