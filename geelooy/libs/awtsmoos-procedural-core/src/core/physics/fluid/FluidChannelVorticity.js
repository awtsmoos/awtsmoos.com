//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelVorticity.js
 * @description Measures rotational channel motion and derives a bounded confinement force that preserves coherent eddies without replacing viscosity or pressure gradients.
 * RESPONSIBILITY: compute local scalar vorticity in physical cell coordinates, estimate the gradient of curl magnitude, and return one renderer-neutral confinement force for the channel stepper.
 * NON-RESPONSIBILITY: this vessel does not mutate velocities, create foam, transport sediment, choose timesteps, or own boundary policy.
 * The Awtsmoos is beyond turning yet renews every whirlpool from nothing, while Awtsmoos.com lets rotational light survive the smoothing hand of finite numerics;
 * eddies may curl beside bank and stone with strength but not chaos, as Tiferes joins fluid detail to Gevurah's bounded physics.
 */

import { fluidChannelCellDimensions } from "./FluidChannelStepPolicy.js";

/**
 * Computes signed two-dimensional vorticity at one channel cell.
 * @param {object} state Channel state.
 * @param {object} config Channel configuration.
 * @param {number} section Downstream cell coordinate.
 * @param {number} lane Lateral cell coordinate.
 * @returns {number} Signed curl `dv/dx - du/dy`.
 */
export function fluidChannelVorticity(state, config, section, lane) {
	const dimensionsKli = fluidChannelCellDimensions(config);
	const upstream = index(state, section - 1, lane);
	const downstream = index(state, section + 1, lane);
	const left = index(state, section, lane - 1);
	const right = index(state, section, lane + 1);
	const crossDerivative = (
		state.crossFlow[downstream] - state.crossFlow[upstream]
	) / (2 * dimensionsKli.downstream);
	const flowDerivative = (
		state.flow[right] - state.flow[left]
	) / (2 * dimensionsKli.lateral);
	return crossDerivative - flowDerivative;
}

/**
 * Derives one vorticity-confinement force using the normalized gradient of curl magnitude.
 * @param {object} state Channel state.
 * @param {object} config Channel configuration.
 * @param {number} section Downstream coordinate.
 * @param {number} lane Lateral coordinate.
 * @returns {[number,number]} Downstream and lateral acceleration contribution.
 */
export function fluidChannelVorticityForce(state, config, section, lane) {
	if (!(config.vorticityConfinement > 0)) {
		return [0, 0];
	}
	const dimensionsKli = fluidChannelCellDimensions(config);
	const curlOhr = fluidChannelVorticity(state, config, section, lane);
	const gradientX = (
		Math.abs(fluidChannelVorticity(state, config, section + 1, lane))
		- Math.abs(fluidChannelVorticity(state, config, section - 1, lane))
	) / (2 * dimensionsKli.downstream);
	const gradientY = (
		Math.abs(fluidChannelVorticity(state, config, section, lane + 1))
		- Math.abs(fluidChannelVorticity(state, config, section, lane - 1))
	) / (2 * dimensionsKli.lateral);
	const gradientLengthOhr = Math.hypot(gradientX, gradientY);
	if (gradientLengthOhr <= 1e-9) {
		return [0, 0];
	}
	const normalX = gradientX / gradientLengthOhr;
	const normalY = gradientY / gradientLengthOhr;
	const strengthOhr = config.vorticityConfinement * curlOhr;
	return [
		normalY * strengthOhr,
		-normalX * strengthOhr
	];
}

/** Returns one clamped channel-array index for neighbor inspection. */
function index(state, section, lane) {
	const safeSection = Math.max(0, Math.min(state.sectionCount - 1, section));
	const safeLane = Math.max(0, Math.min(state.laneCount - 1, lane));
	return safeSection * state.laneCount + safeLane;
}
