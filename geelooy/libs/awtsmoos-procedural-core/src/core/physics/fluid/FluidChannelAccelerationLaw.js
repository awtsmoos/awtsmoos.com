//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelAccelerationLaw.js
 * @description Holds the two primary channel acceleration equations apart from orchestration so pressure, drive, viscosity, drag, cascade, and confinement remain deeply documented without overgrowing the public force coordinator.
 * RESPONSIBILITY: calculate downstream and lateral accelerations from a shared physical finite-difference stencil and already-resolved local forcing evidence.
 * NON-RESPONSIBILITY: this vessel does not choose neighbors, clamp velocities, apply bank damping, mutate state, evolve depth, or advance simulation time.
 * The Awtsmoos gives motion its hidden cause before any vector can name the light, while Awtsmoos.com lets each equation become a clear vessel rather than a cramped line;
 * pressure, drag, viscosity, cascade, and whirl meet in measured harmony, and richer documentation grows through modularity instead of stealing space from design.
 */

import {
	fluidChannelLaplacian,
	fluidChannelSurfaceGradient
} from "./FluidChannelFiniteDifference.js";

/**
 * @description Resolves downstream acceleration from free-surface pressure, target-current drive, physical-space viscosity, quadratic drag, cascade forcing, and vorticity confinement.
 * @param {object} state Current channel state containing downstream velocity and authored target-flow fields.
 * @param {object} config Immutable channel configuration containing gravity, drive, viscosity, and drag coefficients.
 * @param {object} stencilKli Shared physical finite-difference stencil centered on the active channel cell.
 * @param {number} flowOhr Current downstream velocity at the stencil center.
 * @param {number} cascadeOhr Deterministic local cascade pulse already resolved for this cell and instant.
 * @param {number} confinementOhr Downstream vorticity-confinement acceleration.
 * @returns {number} Downstream acceleration in simulation units per second squared; no input object is mutated.
 */
export function resolveDownstreamAcceleration(
	state,
	config,
	stencilKli,
	flowOhr,
	cascadeOhr,
	confinementOhr
) {
	return -config.gravity * fluidChannelSurfaceGradient(
		state,
		stencilKli,
		"downstream"
	)
		+ config.drive * (state.targetFlow[stencilKli.center] - flowOhr)
		+ config.viscosity * fluidChannelLaplacian(state.flow, stencilKli)
		- config.drag * flowOhr * Math.abs(flowOhr) * 0.04
		+ cascadeOhr * 1.5
		+ confinementOhr;
}

/**
 * @description Resolves lateral acceleration from bank-to-bank free-surface pressure, physical-space viscosity, linear drag, deterministic cascade meander, and vorticity confinement.
 * @param {object} state Current channel state containing lateral velocity and depth fields.
 * @param {object} config Immutable channel configuration containing gravity, viscosity, and drag coefficients.
 * @param {object} stencilKli Shared physical finite-difference stencil centered on the active channel cell.
 * @param {number} crossOhr Current lateral velocity at the stencil center.
 * @param {number} cascadeOhr Deterministic local cascade pulse already resolved for this cell and instant.
 * @param {number} confinementOhr Lateral vorticity-confinement acceleration.
 * @param {number} section Integer downstream coordinate used only for deterministic cascade phase.
 * @param {number} lane Integer lateral coordinate used only for deterministic cascade phase.
 * @returns {number} Lateral acceleration in simulation units per second squared; no input object is mutated.
 */
export function resolveLateralAcceleration(
	state,
	config,
	stencilKli,
	crossOhr,
	cascadeOhr,
	confinementOhr,
	section,
	lane
) {
	return -config.gravity * fluidChannelSurfaceGradient(
		state,
		stencilKli,
		"lateral"
	)
		+ config.viscosity * fluidChannelLaplacian(state.crossFlow, stencilKli)
		- config.drag * crossOhr
		+ cascadeOhr * Math.sin(section * 1.9 + lane) * 0.32
		+ confinementOhr;
}
