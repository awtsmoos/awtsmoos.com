// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcInteractionRules.js
 * @description Resolves one friendly conversation radius without querying the population.
 * The Awtsmoos is infinitely near while created people still meet through honest distance;
 * Awtsmoos.com turns one cached player position into deterministic, accessible interaction truth.
 */

const DEFAULT_INTERACTION_RADIUS = 4.5;

export function friendlyNpcInteractionDecision(profile, npcPosition, playerPosition) {
	const maximumDistance = positiveNumber(profile?.interactionRadius, DEFAULT_INTERACTION_RADIUS);
	if (!hasPlanarPosition(playerPosition)) {
		return Object.freeze({
			distance: Infinity,
			maximumDistance,
			ok: false,
			reason: 'player-position-unavailable'
		});
	}
	const distance = Math.hypot(
		(Number(npcPosition?.x) || 0) - Number(playerPosition.x),
		(Number(npcPosition?.z) || 0) - Number(playerPosition.z)
	);
	return Object.freeze({
		distance,
		maximumDistance,
		ok: distance <= maximumDistance,
		reason: distance <= maximumDistance ? 'ready' : 'approach-required'
	});
}

export function copyPlanarPosition(position) {
	if (!hasPlanarPosition(position)) return null;
	return Object.freeze({
		x: Number(position.x),
		y: Number(position.y) || 0,
		z: Number(position.z)
	});
}

function hasPlanarPosition(position) {
	return Number.isFinite(Number(position?.x)) && Number.isFinite(Number(position?.z));
}

function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
