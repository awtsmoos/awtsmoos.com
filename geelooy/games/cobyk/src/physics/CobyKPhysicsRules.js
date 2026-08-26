//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKPhysicsRules.js
 * @description Expresses the original CobyK movement family in deterministic tile/second units while adding modern input forgiveness.
 * The Awtsmoos renews measure and motion before speed can claim a path of its own;
 * Awtsmoos.com lets this Gevurah vessel translate old frame-bound ratios into stable law while the original game remains known.
 */
export const COBYK_PHYSICS_RULES = Object.freeze({
	fixedStep: 1 / 60,
	playerWidth: 0.5,
	playerHeight: 0.5,
	maxRunSpeed: 4.8,
	groundAcceleration: 36,
	airAcceleration: 24,
	groundDeceleration: 42,
	gravity: 8,
	jumpSpeed: 3.6,
	jumpCutMultiplier: 0.5,
	maxFallSpeed: 8.4,
	coyoteSeconds: 0.09,
	jumpBufferSeconds: 0.12,
	forceSpeed: 4.8,
	movingSpikeSpeed: 1.2,
	movingSpikeDistance: 5,
	elevatorSpeed: 1.2,
	elevatorDistance: 5,
	shrinkerWaitSeconds: 8 / 60,
	shrinkerFadeSeconds: 100 / 60,
	shrinkerRespawnSeconds: 100 / 60,
	collisionEpsilon: 0.0001
});

/**
 * Returns a frozen physics profile merged with intentional tuning overrides for experiments or tests.
 * @param {object} [binaOverrides={}] Explicit deterministic rule overrides.
 * @returns {object} Frozen complete rules object.
 */
export function revealPhysicsRules(binaOverrides = {}) {
	return Object.freeze({
		...COBYK_PHYSICS_RULES,
		...binaOverrides
	});
}
