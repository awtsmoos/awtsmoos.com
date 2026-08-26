//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSedimentTransport.js
 * @description Evolves suspended sediment concentration plus erosion/deposition intent as a bounded transport field coupled to solved channel velocity.
 * RESPONSIBILITY: upwind-sample sediment, estimate local carrying capacity from speed/cascade/shear, derive erosion/deposition rates, and write next transport buffers without mutating terrain geometry.
 * NON-RESPONSIBILITY: this vessel does not change bed elevation, create geology, choose timesteps, modify water velocity, or render turbidity.
 * The Awtsmoos carries grain and current in one renewed decree, while Awtsmoos.com lets the river remember where it may carve and where it may lay its burden down;
 * sediment becomes lawful evidence for bank, rock, plant, and color without secretly rebuilding the earth beneath the water's crown.
 */

import { fluidChannelCellDimensions } from "./FluidChannelStepPolicy.js";
import { fluidChannelVorticity } from "./FluidChannelVorticity.js";

/**
 * Advances suspended sediment and geomorphic intent for one cell.
 * @param {object} state Channel state with current/next transport arrays.
 * @param {object} config Channel configuration.
 * @param {number} section Downstream cell coordinate.
 * @param {number} lane Lateral cell coordinate.
 * @param {number} deltaTime Positive simulation timestep.
 * @returns {void}
 */
export function advanceFluidChannelSediment(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const cellOhr = index(state, section, lane);
	const flowOhr = state.flow[cellOhr];
	const crossOhr = state.crossFlow[cellOhr];
	const currentOhr = state.sediment[cellOhr];
	const dimensionsKli = fluidChannelCellDimensions(config);
	const advectedOhr = upwindSediment(
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
	const transportedOhr = mix(currentOhr, advectedOhr, courantOhr);
	const speedOhr = Math.hypot(flowOhr, crossOhr);
	const curlOhr = Math.abs(
		fluidChannelVorticity(state, config, section, lane)
	);
	const capacityOhr = Math.min(
		config.maxSediment,
		config.sedimentCapacity * (
			speedOhr * speedOhr
			+ state.cascade[cellOhr] * 1.4
			+ curlOhr * 0.22
		)
	);
	const bankExposureOhr = bankExposure(state, lane);
	const erosionOhr = Math.max(0, capacityOhr - transportedOhr)
		* config.sedimentErosion
		* (0.55 + bankExposureOhr * 0.45);
	const depositionOhr = Math.max(0, transportedOhr - capacityOhr)
		* config.sedimentSettling;
	state.nextSediment[cellOhr] = clamp(
		transportedOhr + (erosionOhr - depositionOhr) * deltaTime,
		0,
		config.maxSediment
	);
	state.nextErosion[cellOhr] = erosionOhr;
	state.nextDeposition[cellOhr] = depositionOhr;
}

/** Samples upstream sediment along each velocity axis and blends by transport magnitude. */
function upwindSediment(state, section, lane, flowOhr, crossOhr) {
	const downstreamSource = index(
		state,
		section - Math.sign(flowOhr),
		lane
	);
	const lateralSource = index(
		state,
		section,
		lane - Math.sign(crossOhr)
	);
	const longitudinalWeightOhr = Math.abs(flowOhr);
	const lateralWeightOhr = Math.abs(crossOhr);
	const totalOhr = longitudinalWeightOhr + lateralWeightOhr;
	if (totalOhr <= 1e-9) {
		return state.sediment[index(state, section, lane)];
	}
	return (
		state.sediment[downstreamSource] * longitudinalWeightOhr
		+ state.sediment[lateralSource] * lateralWeightOhr
	) / totalOhr;
}

/** Returns normalized proximity to either channel bank. */
function bankExposure(state, lane) {
	const normalizedOhr = lane / Math.max(1, state.laneCount - 1);
	return clamp01(Math.abs(normalizedOhr * 2 - 1));
}

/** Returns one clamped channel-array index. */
function index(state, section, lane) {
	const safeSection = Math.max(0, Math.min(state.sectionCount - 1, section));
	const safeLane = Math.max(0, Math.min(state.laneCount - 1, lane));
	return safeSection * state.laneCount + safeLane;
}

/** Linear interpolation helper. */
function mix(startOhr, endOhr, amountOhr) {
	return startOhr + (endOhr - startOhr) * amountOhr;
}

/** Clamps one scalar into a finite interval. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.max(minimumOhr, Math.min(maximumOhr, valueOhr));
}

/** Clamps one scalar into the unit interval. */
function clamp01(valueOhr) {
	return clamp(Number.isFinite(valueOhr) ? valueOhr : 0, 0, 1);
}
