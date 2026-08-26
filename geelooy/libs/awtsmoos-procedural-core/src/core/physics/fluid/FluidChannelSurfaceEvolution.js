//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSurfaceEvolution.js
 * @description Evolves free-surface depth and foam evidence after primary channel velocities have been resolved in physical space.
 * RESPONSIBILITY: compute velocity-depth flux divergence, relax displaced depth toward authored equilibrium, and derive persistent foam from shear, curl, cascade, and surface disturbance.
 * NON-RESPONSIBILITY: this vessel does not solve velocity forces, transport sediment, choose timesteps, apply impulses, swap buffers, or advance simulation time.
 * The Awtsmoos renews every crest before foam can crown it, while Awtsmoos.com lets conserved depth and visible turbulence answer one another through ordered law;
 * the surface rises, falls, whitens, and clears without confusing visual witness with the hidden current from which those finite signs are drawn.
 */

import { channelNeighborIndices } from "./FluidChannelPrimaryForces.js";
import { fluidChannelCellDimensions } from "./FluidChannelStepPolicy.js";
import { fluidChannelVorticity } from "./FluidChannelVorticity.js";

/**
 * Computes one cell's next depth and foam values.
 * @param {object} state Current channel state.
 * @param {object} config Immutable channel configuration.
 * @param {number} section Downstream coordinate.
 * @param {number} lane Lateral coordinate.
 * @param {number} deltaTime Positive simulation timestep.
 * @returns {{depth:number,foam:number}} Bounded next surface values.
 */
export function resolveFluidChannelSurfaceEvolution(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const cellsKli = channelNeighborIndices(state, section, lane);
	const dimensionsKli = fluidChannelCellDimensions(config);
	const centerOhr = cellsKli.center;
	const depthOhr = state.depth[centerOhr];
	const restOhr = state.restDepth[centerOhr];
	const divergenceOhr = fluxDivergence(state, cellsKli, dimensionsKli);
	const nextDepthOhr = clamp(
		depthOhr - divergenceOhr * deltaTime
			+ (restOhr - depthOhr) * config.depthRelaxation * deltaTime,
		config.minDepth,
		Math.max(config.minDepth, restOhr * config.maxDepthMultiplier)
	);
	return Object.freeze({
		depth: nextDepthOhr,
		foam: resolveFoam(
			state,
			config,
			cellsKli,
			section,
			lane,
			nextDepthOhr,
			restOhr,
			deltaTime
		)
	});
}

/** Computes velocity-depth flux divergence in physical channel coordinates. */
function fluxDivergence(state, cellsKli, dimensionsKli) {
	const downstreamOhr = (
		state.flow[cellsKli.downstream] * state.depth[cellsKli.downstream]
		- state.flow[cellsKli.upstream] * state.depth[cellsKli.upstream]
	) / (2 * dimensionsKli.downstream);
	const lateralOhr = (
		state.crossFlow[cellsKli.right] * state.depth[cellsKli.right]
		- state.crossFlow[cellsKli.left] * state.depth[cellsKli.left]
	) / (2 * dimensionsKli.lateral);
	return downstreamOhr + lateralOhr;
}

/** Resolves persistent foam from energetic local evidence. */
function resolveFoam(
	state,
	config,
	cellsKli,
	section,
	lane,
	depthOhr,
	restOhr,
	deltaTime
) {
	const curlOhr = Math.abs(
		fluidChannelVorticity(state, config, section, lane)
	);
	const shearOhr = Math.abs(
		state.flow[cellsKli.downstream] - state.flow[cellsKli.upstream]
	) + Math.abs(
		state.crossFlow[cellsKli.right] - state.crossFlow[cellsKli.left]
	);
	const disturbanceOhr = Math.abs(depthOhr - restOhr)
		/ Math.max(restOhr, config.minDepth);
	const persistentOhr = state.foam[cellsKli.center]
		* Math.exp(-config.foamDecay * deltaTime);
	const generatedOhr = clamp(
		shearOhr * 0.08
			+ curlOhr * 0.05
			+ state.cascade[cellsKli.center] * 0.72
			+ disturbanceOhr * 0.25,
		0,
		1
	);
	return Math.max(persistentOhr, generatedOhr);
}

/** Clamps one scalar. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.min(maximumOhr, Math.max(minimumOhr, valueOhr));
}
