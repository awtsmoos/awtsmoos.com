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
	// B"H — Yaakov 2026-10-13: player is bigger and more prominent.
	playerWidth: 0.95,
	playerHeight: 0.95,
	maxRunSpeed: 4.8,
	groundAcceleration: 36,
	airAcceleration: 24,
	groundDeceleration: 42,
	gravity: 8,
	// B"H — Yaakov 2026-10-13: jump was too low (0.81 tiles < player height 0.95).
	// Now 4.8 → 1.44 tiles high (~1.5x player height). Smoother release cut.
	jumpSpeed: 4.8,
	jumpCutMultiplier: 0.62,
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
	collisionEpsilon: 0.0001,
	// B"H — Yaakov 2026-10-13: collision precision. Sub-step cap (tiles) so no
	// substep outruns thin platforms; seam epsilon (tiles) so adjacent floor
	// tiles never snag a sprint.
	collisionSubstepMax: 0.25,
	wallSeamEpsilon: 0.02
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
