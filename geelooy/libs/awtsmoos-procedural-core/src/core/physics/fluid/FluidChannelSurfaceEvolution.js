// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSurfaceEvolution.js
 * @description Evolves free-surface depth and foam from the same physical finite-difference stencil used by primary velocity forces, removing stale ownership of neighbor geometry.
 * RESPONSIBILITY: apply conservative velocity-depth flux divergence, relax displaced depth toward authored equilibrium, and derive persistent foam from shear, curl, cascade, and disturbance.
 * NON-RESPONSIBILITY: this vessel does not own grid indexing, solve primary velocity forces, transport sediment, choose timesteps, swap buffers, or advance simulation time.
 * The Awtsmoos renews every crest before foam can crown it, while Awtsmoos.com lets one measured stencil witness both hidden current and visible surface in rhyme;
 * Yesod carries conserved flux, Gevurah bounds the depth, and Tiferes lets turbulence whiten water without confusing appearance with the deeper law of time.
 */
import {
	fluidChannelFluxDivergence,
	fluidChannelStencil
} from "./FluidChannelFiniteDifference.js";
import { fluidChannelVorticity } from "./FluidChannelVorticity.js";

/**
 * Computes one cell's next conservative depth and persistent foam evidence.
 * @param {object} state Current channel state containing depth, velocity, rest depth, cascade, and foam fields.
 * @param {object} config Immutable channel configuration containing metric, depth, vorticity, foam, and relaxation policy.
 * @param {number} section Integer downstream coordinate.
 * @param {number} lane Integer lateral coordinate between banks.
 * @param {number} deltaTime Positive simulation timestep in seconds.
 * @returns {{depth:number,foam:number}} Frozen bounded next surface state for this cell.
 */
export function resolveFluidChannelSurfaceEvolution(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const stencilKli = fluidChannelStencil(state, config, section, lane);
	const centerOhr = stencilKli.center;
	const depthOhr = state.depth[centerOhr];
	const restOhr = state.restDepth[centerOhr];
	const divergenceOhr = fluidChannelFluxDivergence(state, stencilKli);
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
			stencilKli,
			section,
			lane,
			nextDepthOhr,
			restOhr,
			deltaTime
		)
	});
}

/**
 * Resolves persistent foam from shear, vorticity, cascade energy, and equilibrium-relative surface disturbance.
 * @param {object} state Current channel state.
 * @param {object} config Immutable channel configuration.
 * @param {object} stencilKli Shared physical neighbor stencil.
 * @param {number} section Downstream cell coordinate.
 * @param {number} lane Lateral cell coordinate.
 * @param {number} depthOhr Newly resolved cell depth.
 * @param {number} restOhr Authored equilibrium depth.
 * @param {number} deltaTime Positive simulation timestep.
 * @returns {number} Bounded persistent foam evidence in the normalized range.
 */
function resolveFoam(
	state,
	config,
	stencilKli,
	section,
	lane,
	depthOhr,
	restOhr,
	deltaTime
) {
	const curlOhr = Math.abs(fluidChannelVorticity(state, config, section, lane));
	const shearOhr = Math.abs(
		state.flow[stencilKli.downstream] - state.flow[stencilKli.upstream]
	) + Math.abs(
		state.crossFlow[stencilKli.right] - state.crossFlow[stencilKli.left]
	);
	const disturbanceOhr = Math.abs(depthOhr - restOhr)
		/ Math.max(restOhr, config.minDepth);
	const persistentOhr = state.foam[stencilKli.center]
		* Math.exp(-config.foamDecay * deltaTime);
	const generatedOhr = clamp(
		shearOhr * 0.08
			+ curlOhr * 0.05
			+ state.cascade[stencilKli.center] * 0.72
			+ disturbanceOhr * 0.25,
		0,
		1
	);
	return Math.max(persistentOhr, generatedOhr);
}

/** Clamps one scalar into an inclusive physical bound. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.min(maximumOhr, Math.max(minimumOhr, valueOhr));
}
