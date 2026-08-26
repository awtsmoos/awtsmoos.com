//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelStepper.js
 * @description Coordinates one bounded channel substep while primary fluid dynamics and sediment transport remain focused mathematical vessels of their own.
 * RESPONSIBILITY: advance every cell through primary-water and transport laws, swap all current/next buffers consistently, and advance simulation time and step count exactly once.
 * NON-RESPONSIBILITY: this coordinator does not calculate pressure, viscosity, vorticity, sediment capacity, impulses, CFL cadence, interpolation, or diagnostics.
 * The Awtsmoos creates every cell together though code visits them one by one, while Awtsmoos.com lets each law reveal its portion before the buffers exchange their names;
 * one step gathers current, foam, sediment, erosion, and deposition into a unified new instant without hiding the mathematics in procedural flames.
 */

import { advanceFluidChannelCell } from "./FluidChannelCellDynamics.js";
import { advanceFluidChannelSediment } from "./FluidChannelSedimentTransport.js";

/**
 * Advances one channel state through a single positive simulation substep.
 * @param {object} state Mutable channel state.
 * @param {object} config Immutable channel configuration.
 * @param {number} [deltaTime=config.fixedStep] Requested timestep.
 * @returns {object} Same mutable state after the completed substep.
 */
export function stepFluidChannel(
	state,
	config,
	deltaTime = config.fixedStep
) {
	const stepOhr = Math.max(
		config.minimumStep,
		Math.min(config.fixedStep, Number(deltaTime) || config.fixedStep)
	);
	for (let section = 0; section < state.sectionCount; section += 1) {
		for (let lane = 0; lane < state.laneCount; lane += 1) {
			advanceFluidChannelCell(
				state,
				config,
				section,
				lane,
				stepOhr
			);
			advanceFluidChannelSediment(
				state,
				config,
				section,
				lane,
				stepOhr
			);
		}
	}
	swapField(state, "depth", "nextDepth");
	swapField(state, "flow", "nextFlow");
	swapField(state, "crossFlow", "nextCrossFlow");
	swapField(state, "foam", "nextFoam");
	swapField(state, "sediment", "nextSediment");
	swapField(state, "erosion", "nextErosion");
	swapField(state, "deposition", "nextDeposition");
	state.time += stepOhr;
	state.stepCount += 1;
	return state;
}

/** Exchanges one current/next typed-array pair without reallocating simulation storage. */
function swapField(state, currentKeyOhr, nextKeyOhr) {
	const currentOhr = state[currentKeyOhr];
	state[currentKeyOhr] = state[nextKeyOhr];
	state[nextKeyOhr] = currentOhr;
}
