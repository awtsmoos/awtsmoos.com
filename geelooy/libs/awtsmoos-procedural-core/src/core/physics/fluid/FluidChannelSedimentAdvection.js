//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSedimentAdvection.js
 * @description Isolates velocity-aligned suspended-sediment advection so transport coordination can stay small while physical cell scale, upwind sampling, and Courant blending remain deeply documented and reusable.
 * RESPONSIBILITY: resolve the active cell's downstream/lateral velocity, sample sediment from the two velocity-upwind neighbors, derive a bounded Courant blend from physical channel dimensions and timestep, and return the transported concentration before erosion/deposition exchange.
 * NON-RESPONSIBILITY: this vessel does not calculate carrying capacity, write next buffers, mutate terrain, alter velocity, choose the simulation timestep, or render turbidity.
 * The Awtsmoos carries each grain before direction can claim the path, while Awtsmoos.com lets finite current reveal a measured upstream source without confusion;
 * flow and cross-flow weigh their neighboring vessels, Courant guards the blend, and sediment reaches the exchange law through orderly diffusion.
 */

import { fluidChannelCellDimensions } from "./FluidChannelStepPolicy.js";
import { channelIndex } from "./FluidChannelTopology.js";

/**
 * @description Resolves one cell's suspended-sediment concentration after bounded velocity-aligned upwind advection but before local erosion/deposition exchange.
 * @param {object} state Current channel state containing suspended sediment, downstream flow, lateral flow, and topology dimensions.
 * @param {object} config Immutable channel configuration containing physical channel length/width and grid resolution used to derive cell dimensions.
 * @param {number} section Integer downstream cell coordinate.
 * @param {number} lane Integer lateral cell coordinate.
 * @param {number} deltaTime Positive simulation timestep in seconds used to derive the local Courant blend.
 * @returns {number} Advected suspended-sediment concentration; the supplied state and configuration remain unchanged.
 */
export function resolveAdvectedFluidChannelSediment(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const cellOhr = channelIndex(state, section, lane);
	const flowOhr = state.flow[cellOhr];
	const crossOhr = state.crossFlow[cellOhr];
	const dimensionsKli = fluidChannelCellDimensions(config);
	const upstreamOhr = resolveUpwindSediment(
		state,
		section,
		lane,
		flowOhr,
		crossOhr
	);
	const courantOhr = clamp01(
		deltaTime * (
			Math.abs(flowOhr) / dimensionsKli.downstream
			+ Math.abs(crossOhr) / dimensionsKli.lateral
		)
	);
	return mix(
		state.sediment[cellOhr],
		upstreamOhr,
		courantOhr
	);
}

/**
 * @description Samples the velocity-upwind downstream and lateral sediment neighbors, weighting their concentrations by the magnitudes of the velocity components that transport material into the active cell.
 * @param {object} state Current channel state containing suspended sediment and topology dimensions.
 * @param {number} section Integer downstream cell coordinate.
 * @param {number} lane Integer lateral cell coordinate.
 * @param {number} flowOhr Current downstream velocity component at the active cell.
 * @param {number} crossOhr Current lateral velocity component at the active cell.
 * @returns {number} Weighted upwind sediment concentration, or the local concentration when both velocity components are effectively zero.
 */
function resolveUpwindSediment(state, section, lane, flowOhr, crossOhr) {
	const downstreamSourceOhr = channelIndex(
		state,
		section - Math.sign(flowOhr),
		lane
	);
	const lateralSourceOhr = channelIndex(
		state,
		section,
		lane - Math.sign(crossOhr)
	);
	const downstreamWeightOhr = Math.abs(flowOhr);
	const lateralWeightOhr = Math.abs(crossOhr);
	const totalWeightOhr = downstreamWeightOhr + lateralWeightOhr;
	if (totalWeightOhr <= 1e-9) {
		return state.sediment[channelIndex(state, section, lane)];
	}
	return (
		state.sediment[downstreamSourceOhr] * downstreamWeightOhr
		+ state.sediment[lateralSourceOhr] * lateralWeightOhr
	) / totalWeightOhr;
}

/**
 * @description Linearly interpolates between current and upwind sediment concentration using the bounded local Courant amount.
 * @param {number} startOhr Current local sediment concentration.
 * @param {number} endOhr Weighted velocity-upwind sediment concentration.
 * @param {number} amountOhr Bounded interpolation amount from zero through one.
 * @returns {number} Interpolated transported sediment concentration.
 */
function mix(startOhr, endOhr, amountOhr) {
	return startOhr + (endOhr - startOhr) * amountOhr;
}

/**
 * @description Clamps one possibly non-finite scalar into the unit interval so explicit advection cannot overshoot through an excessive local Courant blend.
 * @param {number} valueOhr Candidate Courant scalar.
 * @returns {number} Finite scalar between zero and one inclusive.
 */
function clamp01(valueOhr) {
	return Number.isFinite(valueOhr)
		? Math.min(1, Math.max(0, valueOhr))
		: 0;
}
