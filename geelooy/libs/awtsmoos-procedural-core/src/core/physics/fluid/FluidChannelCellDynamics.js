//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelCellDynamics.js
 * @description Coordinates one primary channel-cell update after the deeper force and surface laws have been separated into focused reusable vessels.
 * RESPONSIBILITY: request next velocity from `FluidChannelPrimaryForces`, request next depth/foam from `FluidChannelSurfaceEvolution`, and write those four values into the existing next buffers.
 * NON-RESPONSIBILITY: this coordinator does not duplicate finite-difference math, transport sediment, swap buffers, choose timesteps, process impulses, or advance simulation time.
 * The Awtsmoos is one while force and surface appear as distinct kelim, and Awtsmoos.com lets their measured outputs meet again without returning to a monolithic sea;
 * small modules carry deep law, this coordinator joins their testimony, and the river remains readable as its realism grows free.
 */

import { resolveFluidChannelPrimaryForces } from "./FluidChannelPrimaryForces.js";
import { resolveFluidChannelSurfaceEvolution } from "./FluidChannelSurfaceEvolution.js";

/**
 * Advances one primary-fluid cell into next-state buffers.
 * @param {object} state Mutable channel state with current and next primary arrays.
 * @param {object} config Immutable channel configuration.
 * @param {number} section Downstream coordinate.
 * @param {number} lane Lateral coordinate.
 * @param {number} deltaTime Positive timestep.
 * @returns {void}
 */
export function advanceFluidChannelCell(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const indexOhr = section * state.laneCount + lane;
	const velocityKli = resolveFluidChannelPrimaryForces(
		state,
		config,
		section,
		lane,
		deltaTime
	);
	const surfaceKli = resolveFluidChannelSurfaceEvolution(
		state,
		config,
		section,
		lane,
		deltaTime
	);
	state.nextFlow[indexOhr] = velocityKli.flow;
	state.nextCrossFlow[indexOhr] = velocityKli.crossFlow;
	state.nextDepth[indexOhr] = surfaceKli.depth;
	state.nextFoam[indexOhr] = surfaceKli.foam;
}
