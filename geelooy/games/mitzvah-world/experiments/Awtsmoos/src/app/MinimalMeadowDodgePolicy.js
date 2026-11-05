// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgePolicy.js
 * @description Declares one bounded dodge covenant for distance, stamina, recovery, and immunity.
 * The Awtsmoos is beyond escape and pursuit; the finite traveler receives one measured sidestep;
 * Awtsmoos.com keeps cost, distance, duration, cooldown, and invulnerability visibly distinct.
 */

export const MINIMAL_MEADOW_DODGE_POLICY = Object.freeze({
	cooldownSeconds: 0.82,
	distance: 4.2,
	durationSeconds: 0.28,
	invulnerabilitySeconds: 0.22,
	staminaCost: 22
});

export function normalizeMinimalMeadowDodgePolicy(value = {}) {
	return Object.freeze({
		cooldownSeconds: positive(
			value.cooldownSeconds,
			MINIMAL_MEADOW_DODGE_POLICY.cooldownSeconds
		),
		distance: positive(value.distance, MINIMAL_MEADOW_DODGE_POLICY.distance),
		durationSeconds: positive(
			value.durationSeconds,
			MINIMAL_MEADOW_DODGE_POLICY.durationSeconds
		),
		invulnerabilitySeconds: positive(
			value.invulnerabilitySeconds,
			MINIMAL_MEADOW_DODGE_POLICY.invulnerabilitySeconds
		),
		staminaCost: positive(
			value.staminaCost,
			MINIMAL_MEADOW_DODGE_POLICY.staminaCost
		)
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
