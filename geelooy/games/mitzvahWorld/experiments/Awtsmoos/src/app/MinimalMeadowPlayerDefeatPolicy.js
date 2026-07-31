// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatPolicy.js
 * @description Declares and normalizes the finite defeat delay, health, retry, and animation covenant.
 * The Awtsmoos is never defeated; the playable vessel may fall and be renewed;
 * Awtsmoos.com keeps timing, visible meaning, retry bounds, and recovery truth explicit.
 */

export const MINIMAL_MEADOW_PLAYER_DEFEAT_POLICY = Object.freeze({
	animationPatterns: Object.freeze([
		/death|defeat|die|collapse|knockout/i,
		/fall|impact|hit/i
	]),
	maxHealth: 100,
	maximumRetrySeconds: 3.2,
	proceduralAction: 'player-defeat-procedural',
	respawnDelaySeconds: 3.2,
	retryStepSeconds: 0
});

export function defaultMinimalMeadowDefeatPolicy(runtime = {}) {
	return {
		...MINIMAL_MEADOW_PLAYER_DEFEAT_POLICY,
		maxHealth: positive(
			runtime.playerStats?.maxHealth,
			MINIMAL_MEADOW_PLAYER_DEFEAT_POLICY.maxHealth
		)
	};
}

export function normalizeMinimalMeadowDefeatPolicy(
	value = {},
	fallback = MINIMAL_MEADOW_PLAYER_DEFEAT_POLICY
) {
	const respawnDelaySeconds = positive(
		value.respawnDelaySeconds,
		fallback.respawnDelaySeconds
	);
	return Object.freeze({
		animationPatterns: fallback.animationPatterns,
		maxHealth: positive(value.maxHealth, fallback.maxHealth),
		maximumRetrySeconds: positive(
			value.maximumRetrySeconds,
			respawnDelaySeconds
		),
		proceduralAction: fallback.proceduralAction,
		respawnDelaySeconds,
		retryStepSeconds: Math.max(
			0,
			Number(value.retryStepSeconds ?? fallback.retryStepSeconds) || 0
		)
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
