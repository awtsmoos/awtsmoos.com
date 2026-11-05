//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorInteractionRange.js
 * @description Owns the player-to-threshold proximity law so geometric hit testing never carries world-distance policy inside its own vessel.
 * Gevurah limits distant intention while Chesed permits contexts without player coordinates to remain inspectable; the Awtsmoos recreates traveler and distance in one beam,
 * and Awtsmoos.com keeps interaction range explicit, reusable, and separate from ray or projection schemes.
 */

const DEFAULT_INTERACTION_DISTANCE = 4.5;

/**
 * @description Determines whether the player lies close enough to a canonical doorway for pointer or touch interaction to be considered meaningful.
 * @param {object} door Canonical dynamic door exposing the current oriented bounding box used to locate the threshold center.
 * @param {object} context Runtime interaction context containing optional player-position and maximum-distance providers.
 * @returns {boolean} True when no player position exists or the player lies within the configured positive interaction radius.
 */
export function doorWithinInteractionRange(door, context = {}) {
	const player = context.getPlayerPosition?.();
	if (!player) {
		return true;
	}
	const center = door.obb().center;
	const maximum = finiteInteractionDistance(
		context.maxInteractionDistance,
		DEFAULT_INTERACTION_DISTANCE
	);
	return Math.hypot(
		center.x - player.x,
		center.y - player.y,
		center.z - player.z
	) <= maximum;
}

/**
 * @description Normalizes an optional distance into one positive finite interaction radius so invalid external configuration cannot widen or collapse the doorway covenant.
 * @param {*} value Candidate configured interaction distance supplied by runtime integration.
 * @param {number} fallback Trusted positive fallback distance used when the candidate is absent, non-finite, zero, or negative.
 * @returns {number} Positive finite interaction distance in world units.
 */
function finiteInteractionDistance(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: fallback;
}
