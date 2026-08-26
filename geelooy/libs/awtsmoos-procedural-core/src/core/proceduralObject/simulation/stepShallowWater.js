//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stepShallowWater.js
 * @description Advances conserved shallow-water motion and its transported foam, sediment, and shoreline-memory fields through one CFL-safe public doorway.
 * RESPONSIBILITY: clone canonical arrays, run conservative hydrodynamic substeps, apply authored forcing, advance passive realism fields with the resulting velocity, and rebuild one immutable state.
 * NON-RESPONSIBILITY: this vessel does not compute numerical fluxes, choose passive-field generation policy, render water, or mutate caller-owned state.
 * The Awtsmoos advances river and ripple through hidden moments while foam and silt ride the same renewing tide;
 * Awtsmoos.com keeps old stepping callers whole as new layers travel faithfully beside the conserved current inside.
 */

import { createShallowWaterState } from "./createShallowWaterState.js";
import { applyShallowWaterForces } from "./shallowWaterForces.js";
import { stepShallowWaterSecondaryFields } from "./shallowWaterSecondaryFields.js";
import { planShallowWaterSubsteps } from "./shallowWaterStability.js";
import { stepShallowWaterKernel } from "./shallowWaterStepKernel.js";

/**
 * Copies immutable state layers into one mutable numerical working set.
 * @param {object} state Canonical shallow-water state.
 * @returns {object} Mutable hydrodynamic and passive arrays.
 */
function mutableArrays(state) {
	return {
		foam: [...state.foam.values],
		height: [...state.height.values],
		sediment: [...state.sediment.values],
		velocityX: [...state.velocity.x],
		velocityY: [...state.velocity.y],
		wetness: [...state.wetness.values]
	};
}

/**
 * Builds the next canonical-state input without losing authored terrain, forcing, policy, or compatibility fields.
 * @param {object} state Previous canonical state.
 * @param {object} arrays Final mutable arrays after all substeps.
 * @param {number} deltaTime Full caller timestep.
 * @returns {object} Input document for `createShallowWaterState`.
 */
function nextStateInput(state, arrays, deltaTime) {
	return {
		boundary: state.boundary,
		damping: state.damping,
		foamGrid: scalarGrid(state, arrays.foam),
		gravity: state.gravity,
		heightGrid: scalarGrid(state, arrays.height),
		id: state.id,
		minDepth: state.minDepth,
		obstacleGrid: state.obstacles,
		rainRate: state.rainRate,
		secondary: state.secondary,
		sedimentGrid: scalarGrid(state, arrays.sediment),
		solver: state.solver,
		sources: state.sources,
		terrainGrid: state.terrain,
		tick: state.tick + 1,
		time: state.time + deltaTime,
		velocityGrid: {
			x: arrays.velocityX,
			y: arrays.velocityY
		},
		viscosity: state.viscosity,
		wetnessGrid: scalarGrid(state, arrays.wetness)
	};
}

/**
 * Creates one scalar-grid input aligned to the existing hydrodynamic lattice.
 * @param {object} state Canonical shallow-water state.
 * @param {number[]} valuesOhr Scalar values for the new state.
 * @returns {object} Grid input record.
 */
function scalarGrid(state, valuesOhr) {
	return {
		cellSize: state.height.cellSize,
		height: state.height.height,
		values: valuesOhr,
		width: state.height.width
	};
}

/**
 * Advances shallow water with CFL protection, forcing, and transported secondary realism.
 * @param {object} state Canonical shallow-water state.
 * @param {object} [options={}] Delta time, substep, source, and rain overrides.
 * @returns {object} New immutable shallow-water state.
 */
export function stepShallowWater(state, options = {}) {
	const deltaTimeOhr = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	if (deltaTimeOhr === 0) {
		return state;
	}
	const planKli = planShallowWaterSubsteps(state, deltaTimeOhr, options);
	const substepDampingOhr = Math.pow(state.damping, 1 / planKli.substeps);
	let arraysKli = mutableArrays(state);
	for (let stepOrdinal = 0; stepOrdinal < planKli.substeps; stepOrdinal += 1) {
		const hydroKli = stepShallowWaterKernel(
			state,
			arraysKli,
			planKli.substepDelta,
			substepDampingOhr
		);
		applyShallowWaterForces(state, hydroKli, planKli.substepDelta, options);
		const secondaryKli = stepShallowWaterSecondaryFields(
			state,
			arraysKli,
			hydroKli,
			planKli.substepDelta
		);
		arraysKli = {
			...hydroKli,
			...secondaryKli
		};
	}
	return createShallowWaterState(nextStateInput(state, arraysKli, deltaTimeOhr));
}
