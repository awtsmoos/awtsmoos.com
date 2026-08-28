//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelFiniteDifference.js
 * @description Centralizes physical-coordinate neighbor indexing and finite-difference operators shared by channel force and free-surface laws.
 * RESPONSIBILITY: provide clamped neighbor indices, equilibrium-surface gradients, anisotropic Laplacians, and velocity-depth flux divergence from one consistent channel metric.
 * NON-RESPONSIBILITY: this vessel does not apply forces, evolve depth, transport sediment, choose timesteps, or mutate simulation arrays.
 * The Awtsmoos is beyond distance while every finite current must cross measured space, and Awtsmoos.com lets one metric govern every derivative so separate laws do not disagree;
 * downstream and bankward dimensions become shared testimony, allowing pressure, diffusion, and conservation to meet in Tiferes faithfully.
 */

import { fluidChannelCellDimensions } from "./FluidChannelStepPolicy.js";

/** Returns center and four-neighbor indices plus physical cell dimensions. */
export function fluidChannelStencil(state, config, section, lane) {
	return Object.freeze({
		center: index(state, section, lane),
		dimensions: fluidChannelCellDimensions(config),
		downstream: index(state, section + 1, lane),
		left: index(state, section, lane - 1),
		right: index(state, section, lane + 1),
		upstream: index(state, section - 1, lane)
	});
}

/** Computes equilibrium-relative free-surface gradient along downstream or lateral axis. */
export function fluidChannelSurfaceGradient(state, stencilKli, axisOhr) {
	const lateralOhr = axisOhr === "lateral";
	const positiveOhr = lateralOhr ? stencilKli.right : stencilKli.downstream;
	const negativeOhr = lateralOhr ? stencilKli.left : stencilKli.upstream;
	const spacingOhr = lateralOhr
		? stencilKli.dimensions.lateral
		: stencilKli.dimensions.downstream;
	return (
		surfaceOffset(state, positiveOhr) - surfaceOffset(state, negativeOhr)
	) / (2 * spacingOhr);
}

/** Computes an anisotropic two-dimensional Laplacian for one scalar field. */
export function fluidChannelLaplacian(fieldOhr, stencilKli) {
	const downstreamOhr = (
		fieldOhr[stencilKli.upstream] - 2 * fieldOhr[stencilKli.center]
		+ fieldOhr[stencilKli.downstream]
	) / (stencilKli.dimensions.downstream ** 2);
	const lateralOhr = (
		fieldOhr[stencilKli.left] - 2 * fieldOhr[stencilKli.center]
		+ fieldOhr[stencilKli.right]
	) / (stencilKli.dimensions.lateral ** 2);
	return downstreamOhr + lateralOhr;
}

/** Computes centered velocity-depth flux divergence for free-surface evolution. */
export function fluidChannelFluxDivergence(state, stencilKli) {
	const downstreamOhr = (
		state.flow[stencilKli.downstream] * state.depth[stencilKli.downstream]
		- state.flow[stencilKli.upstream] * state.depth[stencilKli.upstream]
	) / (2 * stencilKli.dimensions.downstream);
	const lateralOhr = (
		state.crossFlow[stencilKli.right] * state.depth[stencilKli.right]
		- state.crossFlow[stencilKli.left] * state.depth[stencilKli.left]
	) / (2 * stencilKli.dimensions.lateral);
	return downstreamOhr + lateralOhr;
}

/** Returns displacement from authored equilibrium depth. */
function surfaceOffset(state, indexOhr) {
	return state.depth[indexOhr] - state.restDepth[indexOhr];
}

/** Returns one clamped channel-array index. */
function index(state, section, lane) {
	const safeSectionOhr = Math.min(state.sectionCount - 1, Math.max(0, section));
	const safeLaneOhr = Math.min(state.laneCount - 1, Math.max(0, lane));
	return safeSectionOhr * state.laneCount + safeLaneOhr;
}
