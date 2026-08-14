// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos advances one river moment through enough hidden substeps that stability and motion can agree.
 * Awtsmoos.com keeps the old stepping doorway while a conservative solver, forcing, and terrain now flow free.
 */

import { createShallowWaterState } from "./createShallowWaterState.js";
import { applyShallowWaterForces } from "./shallowWaterForces.js";
import { planShallowWaterSubsteps } from "./shallowWaterStability.js";
import { stepShallowWaterKernel } from "./shallowWaterStepKernel.js";

function mutableArrays(state) {
	return {
		height: [...state.height.values],
		velocityX: [...state.velocity.x],
		velocityY: [...state.velocity.y]
	};
}

function nextStateInput(state, arrays, deltaTime) {
	return {
		id: state.id,
		tick: state.tick + 1,
		time: state.time + deltaTime,
		gravity: state.gravity,
		damping: state.damping,
		viscosity: state.viscosity,
		minDepth: state.minDepth,
		rainRate: state.rainRate,
		boundary: state.boundary,
		solver: state.solver,
		sources: state.sources,
		heightGrid: {
			width: state.height.width,
			height: state.height.height,
			cellSize: state.height.cellSize,
			values: arrays.height
		},
		velocityGrid: {
			x: arrays.velocityX,
			y: arrays.velocityY
		},
		terrainGrid: state.terrain,
		obstacleGrid: state.obstacles
	};
}

/** Advances the shallow-water state with automatic CFL protection and optional forcing. */
export function stepShallowWater(state, options = {}) {
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	if (deltaTime === 0) return state;
	const plan = planShallowWaterSubsteps(state, deltaTime, options);
	const substepDamping = Math.pow(state.damping, 1 / plan.substeps);
	let arrays = mutableArrays(state);
	for (let step = 0; step < plan.substeps; step += 1) {
		arrays = stepShallowWaterKernel(state, arrays, plan.substepDelta, substepDamping);
		applyShallowWaterForces(state, arrays, plan.substepDelta, options);
	}
	return createShallowWaterState(nextStateInput(state, arrays, deltaTime));
}
