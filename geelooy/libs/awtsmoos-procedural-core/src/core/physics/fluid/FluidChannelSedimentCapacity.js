//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSedimentCapacity.js
 * @description Separates carrying capacity and geomorphic exchange rates from suspended-sediment advection so transport mathematics can evolve without bloating the channel stepper.
 * RESPONSIBILITY: derive local sediment capacity from speed, cascade, curl, and bank exposure, then resolve erosion/deposition rates under authored transport coefficients.
 * NON-RESPONSIBILITY: this vessel does not advect concentration, mutate terrain, write buffers, choose timesteps, or sample rendering turbidity.
 * The Awtsmoos carries every grain before erosion or rest can claim its path, while Awtsmoos.com lets current strength and bank exposure speak through one bounded law;
 * carving and settling become explicit witnesses, so geology may answer later without the water secretly reshaping what it saw.
 */

import { fluidChannelVorticity } from "./FluidChannelVorticity.js";

/**
 * Resolves carrying capacity plus erosion/deposition rates for one channel cell.
 * @param {object} state Current channel state.
 * @param {object} config Immutable channel configuration.
 * @param {number} section Downstream coordinate.
 * @param {number} lane Lateral coordinate.
 * @param {number} concentrationOhr Advected suspended-sediment concentration.
 * @returns {{capacity:number,erosion:number,deposition:number}} Local exchange evidence.
 */
export function resolveFluidChannelSedimentCapacity(
	state,
	config,
	section,
	lane,
	concentrationOhr
) {
	const indexOhr = section * state.laneCount + lane;
	const speedOhr = Math.hypot(
		state.flow[indexOhr],
		state.crossFlow[indexOhr]
	);
	const curlOhr = Math.abs(
		fluidChannelVorticity(state, config, section, lane)
	);
	const capacityOhr = Math.min(
		config.maxSediment,
		config.sedimentCapacity * (
			speedOhr * speedOhr
			+ state.cascade[indexOhr] * 1.4
			+ curlOhr * 0.22
		)
	);
	const bankOhr = bankExposure(state, lane);
	return Object.freeze({
		capacity: capacityOhr,
		deposition: Math.max(0, concentrationOhr - capacityOhr)
			* config.sedimentSettling,
		erosion: Math.max(0, capacityOhr - concentrationOhr)
			* config.sedimentErosion
			* (0.55 + bankOhr * 0.45)
	});
}

/** Returns normalized proximity to either channel bank. */
function bankExposure(state, lane) {
	const normalizedOhr = lane / Math.max(1, state.laneCount - 1);
	return Math.min(1, Math.max(0, Math.abs(normalizedOhr * 2 - 1)));
}
