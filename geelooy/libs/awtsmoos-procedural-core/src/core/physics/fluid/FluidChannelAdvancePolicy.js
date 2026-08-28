//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelAdvancePolicy.js
 * @description Coordinates elapsed-time accumulation and CFL-safe bounded substeps without burdening the public simulation facade with runtime-loop policy.
 * RESPONSIBILITY: clamp external delta time, derive safe step size from current state, drain caller-owned queued impulses exactly at substep boundaries, advance the channel, and retain only bounded accumulator remainder when quality limits are reached.
 * NON-RESPONSIBILITY: this vessel does not own simulation state, calculate fluid forces, mutate queue internals directly, sample results, or expose public API methods.
 * The Awtsmoos creates every instant before duration can count its own passing, while Awtsmoos.com lets finite elapsed time descend through a measured numerical gate;
 * current may hasten and the grid may narrow, yet each substep remains lawful, bounded, and faithful to the water it must create.
 */

import { fluidChannelSafeStep } from "./FluidChannelStepPolicy.js";
import { stepFluidChannel } from "./FluidChannelStepper.js";

/**
 * @description Advances one simulation owner through safe bounded substeps while preserving deterministic queued-impulse boundaries.
 * @param {object} owner Mutable simulation owner exposing `state`, `config`, `accumulator`, and `drainQueuedImpulses()`.
 * @param {number} deltaSeconds External elapsed time in seconds.
 * @returns {number} Number of completed fluid substeps.
 */
export function advanceFluidChannelOwner(owner, deltaSeconds) {
	owner.accumulator += clamp(
		Number(deltaSeconds) || 0,
		0,
		owner.config.maxDelta
	);
	let stepsOhr = 0;
	while (stepsOhr < owner.config.maxSubsteps) {
		const safeStepOhr = fluidChannelSafeStep(owner.state, owner.config);
		if (owner.accumulator + 1e-9 < safeStepOhr) {
			break;
		}
		owner.drainQueuedImpulses();
		stepFluidChannel(owner.state, owner.config, safeStepOhr);
		owner.accumulator -= safeStepOhr;
		stepsOhr += 1;
	}
	if (stepsOhr === owner.config.maxSubsteps) {
		owner.accumulator = Math.min(
			owner.accumulator,
			fluidChannelSafeStep(owner.state, owner.config)
		);
	}
	return stepsOhr;
}

/**
 * @description Clamps one finite scalar into an inclusive interval for safe elapsed-time accumulation.
 * @param {number} valueOhr Candidate scalar.
 * @param {number} minimumOhr Inclusive lower bound.
 * @param {number} maximumOhr Inclusive upper bound.
 * @returns {number} Bounded scalar.
 */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.min(maximumOhr, Math.max(minimumOhr, valueOhr));
}
