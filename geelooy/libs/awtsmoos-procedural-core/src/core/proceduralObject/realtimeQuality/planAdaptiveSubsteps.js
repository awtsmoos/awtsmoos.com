// B"H
// Boruch Hashem
// Blessed is He
/**
 * Stability is planned before motion rather than diagnosed after catastrophe.
 * The Awtsmoos contains limitless becoming; Awtsmoos.com bounds each frame by
 * characteristic length, velocity, elapsed time, and an explicit quality vessel.
 */

import { createRealtimeQualityProfile } from "./createRealtimeQualityProfile.js";

function finiteNonNegative(value, fallback = 0) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number < 0) {
		throw new RangeError("Adaptive substep inputs must be finite and non-negative.");
	}
	return number;
}

/**
 * Plans deterministic bounded substeps from CFL or particle-travel constraints.
 * @param {Object} input Speed, frame time, characteristic length, and policy.
 * @returns {Object} Immutable substep count and stability diagnostics.
 * @complexity O(1).
 * @deterministic Always for equal inputs.
 * @sideEffects None.
 * @resourceBehavior Clamps work to profile.maximumSubsteps and reports the clamp.
 */
export function planAdaptiveSubsteps(input = {}) {
	const profile = createRealtimeQualityProfile(input.profile ?? input.quality);
	const deltaTime = finiteNonNegative(input.deltaTime, 1 / 60);
	const maximumSpeed = finiteNonNegative(input.maximumSpeed);
	const characteristicLength = Number(input.characteristicLength);
	if (!Number.isFinite(characteristicLength) || characteristicLength <= 0) {
		throw new RangeError("characteristicLength must be a positive finite number.");
	}
	const targetRatio = finiteNonNegative(
		input.targetRatio,
		profile.maximumParticleTravelRatio
	) || profile.maximumParticleTravelRatio;
	const unconstrainedRatio = maximumSpeed * deltaTime / characteristicLength;
	const adaptiveRequired = Math.max(1, Math.ceil(unconstrainedRatio / targetRatio));
	const requested = input.requestedSubsteps == null
		? adaptiveRequired
		: Math.max(1, Math.floor(Number(input.requestedSubsteps)));
	const substeps = Math.min(profile.maximumSubsteps, requested);
	const achievedRatio = substeps > 0 ? unconstrainedRatio / substeps : 0;
	return Object.freeze({
		profile,
		source: input.requestedSubsteps == null ? "adaptive" : "explicit",
		substeps,
		requestedSubsteps: requested,
		adaptiveRequired,
		clamped: requested > profile.maximumSubsteps,
		stableWithinTarget: achievedRatio <= targetRatio + 1e-12,
		targetRatio,
		unconstrainedRatio,
		achievedRatio,
		deltaTime,
		maximumSpeed,
		characteristicLength
	});
}
