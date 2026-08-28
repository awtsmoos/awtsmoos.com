//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelPrimaryForces.js
 * @description Coordinates one channel cell's primary velocity update while acceleration equations, cascade forcing, finite-difference geometry, and topology compatibility remain focused in dedicated modules.
 * RESPONSIBILITY: gather the physical stencil, deterministic cascade pulse, vorticity confinement, and acceleration-law outputs; apply bank damping and authored speed bounds; preserve the historical neighbor-index export without carrying its implementation.
 * NON-RESPONSIBILITY: this vessel does not implement topology, pressure/viscosity equations, cascade phase mathematics, depth/foam/sediment evolution, buffer swapping, timestep selection, or clock advancement.
 * The Awtsmoos gives every river force its hidden source, while Awtsmoos.com lets each finite law dwell in a vessel small enough to read and strong enough to endure;
 * Chessed and Gevurah meet through Tiferes, documentation remains full, and modular clarity becomes the bank through which deeper realism may securely pour.
 */

import {
	resolveDownstreamAcceleration,
	resolveLateralAcceleration
} from "./FluidChannelAccelerationLaw.js";
import { resolveFluidChannelCascadePulse } from "./FluidChannelCascadeForcing.js";
import { fluidChannelStencil } from "./FluidChannelFiniteDifference.js";
import { fluidChannelVorticityForce } from "./FluidChannelVorticity.js";
export { channelNeighborIndices } from "./FluidChannelTopology.js";

/**
 * @description Computes the next bounded downstream/lateral velocity pair for one channel cell without mutating current-state buffers, delegating each physical sub-law to its focused module.
 * @param {object} state Current channel state containing velocity, target-flow, cascade, depth, time, and topology fields.
 * @param {object} config Immutable channel configuration containing force coefficients, physical dimensions, and speed/bank bounds.
 * @param {number} section Integer downstream cell coordinate.
 * @param {number} lane Integer lateral cell coordinate.
 * @param {number} deltaTime Positive simulation timestep in seconds.
 * @returns {{flow:number,crossFlow:number}} Frozen next-velocity pair bounded by `config.maxSpeed`; supplied state/config are not mutated.
 */
export function resolveFluidChannelPrimaryForces(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const stencilKli = fluidChannelStencil(state, config, section, lane);
	const centerOhr = stencilKli.center;
	const flowOhr = state.flow[centerOhr];
	const crossOhr = state.crossFlow[centerOhr];
	const confinementOhr = fluidChannelVorticityForce(
		state,
		config,
		section,
		lane
	);
	const cascadeOhr = resolveFluidChannelCascadePulse(
		state,
		centerOhr,
		section,
		lane
	);
	const nextFlowOhr = flowOhr + resolveDownstreamAcceleration(
		state,
		config,
		stencilKli,
		flowOhr,
		cascadeOhr,
		confinementOhr[0]
	) * deltaTime;
	let nextCrossOhr = crossOhr + resolveLateralAcceleration(
		state,
		config,
		stencilKli,
		crossOhr,
		cascadeOhr,
		confinementOhr[1],
		section,
		lane
	) * deltaTime;
	if (lane === 0 || lane === state.laneCount - 1) {
		nextCrossOhr *= config.bankDamping;
	}
	return Object.freeze({
		crossFlow: boundedVelocity(nextCrossOhr, config.maxSpeed),
		flow: boundedVelocity(nextFlowOhr, config.maxSpeed)
	});
}

/**
 * @description Bounds one resolved velocity component symmetrically around zero so no combined force can exceed the authored simulation speed envelope.
 * @param {number} valueOhr Candidate downstream or lateral velocity after integration.
 * @param {number} maximumSpeedOhr Positive authored absolute speed limit.
 * @returns {number} Velocity clamped into `[-maximumSpeedOhr, maximumSpeedOhr]`.
 */
function boundedVelocity(valueOhr, maximumSpeedOhr) {
	return Math.min(
		maximumSpeedOhr,
		Math.max(-maximumSpeedOhr, valueOhr)
	);
}
