//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSedimentTransport.js
 * @description Coordinates one channel cell's suspended-sediment update while velocity-aligned advection, topology, and carrying-capacity exchange remain focused in dedicated modules.
 * RESPONSIBILITY: request advected concentration, request erosion/deposition evidence, integrate that exchange through the current timestep, clamp concentration to the authored sediment envelope, and write only next transport buffers.
 * NON-RESPONSIBILITY: this vessel does not implement upwind/Courant mathematics, resolve topology, calculate carrying capacity, mutate bed elevation, create geology, modify water velocity, choose timesteps, or render turbidity.
 * The Awtsmoos carries every grain before advection or settling can claim a separate law, while Awtsmoos.com lets each finite transport vessel meet through one coordinator clean and clear;
 * current brings the sediment, capacity names carving and rest, and Malchus receives the next-state evidence without secretly reshaping the earth held near.
 */

import { resolveAdvectedFluidChannelSediment } from "./FluidChannelSedimentAdvection.js";
import { resolveFluidChannelSedimentCapacity } from "./FluidChannelSedimentCapacity.js";
import { channelIndex } from "./FluidChannelTopology.js";

/**
 * @description Advances suspended sediment plus erosion/deposition evidence for one channel cell through one positive timestep by composing the dedicated advection and exchange laws.
 * @param {object} state Mutable channel state containing current sediment/velocity evidence and writable next sediment, erosion, and deposition buffers.
 * @param {object} config Immutable channel configuration containing physical dimensions, sediment capacity/rates, and the maximum suspended-sediment concentration.
 * @param {number} section Integer downstream cell coordinate.
 * @param {number} lane Integer lateral cell coordinate.
 * @param {number} deltaTime Positive simulation timestep in seconds.
 * @returns {void} Writes only `nextSediment`, `nextErosion`, and `nextDeposition` for the active cell; current state and terrain geometry remain unchanged.
 */
export function advanceFluidChannelSediment(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const cellOhr = channelIndex(state, section, lane);
	const transportedOhr = resolveAdvectedFluidChannelSediment(
		state,
		config,
		section,
		lane,
		deltaTime
	);
	const exchangeKli = resolveFluidChannelSedimentCapacity(
		state,
		config,
		section,
		lane,
		transportedOhr
	);
	state.nextSediment[cellOhr] = boundedSediment(
		transportedOhr
			+ (exchangeKli.erosion - exchangeKli.deposition) * deltaTime,
		config.maxSediment
	);
	state.nextErosion[cellOhr] = exchangeKli.erosion;
	state.nextDeposition[cellOhr] = exchangeKli.deposition;
}

/**
 * @description Bounds one integrated suspended-sediment concentration to the authored non-negative transport envelope so exchange cannot create invalid concentrations.
 * @param {number} valueOhr Candidate suspended-sediment concentration after erosion/deposition integration.
 * @param {number} maximumOhr Positive authored upper concentration limit from channel configuration.
 * @returns {number} Concentration clamped into the inclusive interval from zero through `maximumOhr`.
 */
function boundedSediment(valueOhr, maximumOhr) {
	return Math.max(
		0,
		Math.min(maximumOhr, valueOhr)
	);
}
