//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSampling.js
 * @description Reveals one semantic local river sample while all bilinear grid mathematics remain hidden in the focused sampling kernel.
 * RESPONSIBILITY: preserve historical depth/current/foam/cascade fields, add sediment/erosion/deposition/turbidity/bank evidence, derive speed and surface displacement, and reuse a caller-supplied target without exposing mutable solver arrays.
 * NON-RESPONSIBILITY: this vessel does not advance water, calculate interpolation weights, mutate state, derive vegetation suitability, change terrain, queue impulses, or create optical materials.
 * The Awtsmoos conceals infinite renewal inside every finite coordinate, while Awtsmoos.com lets one clear sample carry only the testimony gameplay and ecology truly need;
 * current, foam, mud, carving, settling, bank nearness, and curl become readable signs without giving callers the river's private numerical seed.
 */

import {
	fluidChannelSamplingCoordinates,
	sampleFluidChannelField,
	sampleOptionalFluidChannelField,
	sampledFluidChannelVorticity
} from "./FluidChannelSamplingKernel.js";

/**
 * @description Bilinearly samples normalized downstream and bank-to-bank coordinates into one reusable semantic water record, preserving all historical fields while adding transport and ecology evidence.
 * @param {object} state Current channel state containing primary and optional transport typed-array fields.
 * @param {number} downstream Normalized downstream coordinate in the inclusive range zero through one; out-of-range values are clamped by the sampling kernel.
 * @param {number} lateral Normalized bank-to-bank coordinate in the inclusive range zero through one; zero and one represent opposite banks.
 * @param {object} [target={}] Reusable mutable output object that is populated and returned to avoid mandatory allocation in high-frequency sampling paths.
 * @param {object|null} [config=null] Optional physical channel configuration used for physically scaled vorticity and sediment-to-turbidity normalization; legacy sampling remains valid when absent.
 * @returns {object} The same `target` object populated with depth, restDepth, flow, crossFlow, foam, cascade, sediment, erosion, deposition, speed, surfaceOffset, bankProximity, turbidity, and vorticity.
 */
export function sampleFluidChannel(
	state,
	downstream,
	lateral,
	target = {},
	config = null
) {
	const coordinatesKli = fluidChannelSamplingCoordinates(
		state,
		downstream,
		lateral
	);
	target.depth = sampleFluidChannelField(state, state.depth, coordinatesKli);
	target.restDepth = sampleFluidChannelField(
		state,
		state.restDepth,
		coordinatesKli
	);
	target.flow = sampleFluidChannelField(state, state.flow, coordinatesKli);
	target.crossFlow = sampleFluidChannelField(
		state,
		state.crossFlow,
		coordinatesKli
	);
	target.foam = sampleFluidChannelField(state, state.foam, coordinatesKli);
	target.cascade = sampleFluidChannelField(
		state,
		state.cascade,
		coordinatesKli
	);
	target.sediment = sampleOptionalFluidChannelField(
		state,
		state.sediment,
		coordinatesKli
	);
	target.erosion = sampleOptionalFluidChannelField(
		state,
		state.erosion,
		coordinatesKli
	);
	target.deposition = sampleOptionalFluidChannelField(
		state,
		state.deposition,
		coordinatesKli
	);
	target.speed = Math.hypot(target.flow, target.crossFlow);
	target.surfaceOffset = target.depth - target.restDepth;
	target.bankProximity = Math.abs(clamp01(lateral) * 2 - 1);
	target.turbidity = clamp01(
		target.sediment / Math.max(0.0001, config?.maxSediment || 1)
	);
	target.vorticity = sampledFluidChannelVorticity(
		state,
		config,
		coordinatesKli
	);
	return target;
}

/**
 * @description Clamps one possibly non-finite scalar into the unit interval for derived semantic sample fields such as bank proximity and turbidity.
 * @param {number} valueOhr Candidate scalar value.
 * @returns {number} Finite scalar between zero and one inclusive.
 */
function clamp01(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr)
		? Math.min(1, Math.max(0, numberOhr))
		: 0;
}
