//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shallowWaterSecondaryFields.js
 * @description Orchestrates transport and local evolution of foam, suspended sediment, and remembered shoreline wetness over the canonical hydrodynamic step.
 * RESPONSIBILITY: advect transportable passive fields with the evolved velocity, sample shared local flow derivatives, and delegate cell chemistry to the focused secondary-evolution law.
 * NON-RESPONSIBILITY: this vessel does not alter conserved water mass or momentum, implement interpolation mathematics, define foam chemistry, or render water.
 * The Awtsmoos carries foam and silt through one river while shore remembers where the renewed current stood;
 * Awtsmoos.com keeps transport, derivatives, and evolution in separate clear kelim, so deeper water remains modular and good.
 */

import { evolveShallowWaterSecondaryCell } from "./shallowWaterSecondaryEvolution.js";
import { advectShallowWaterScalar } from "./shallowWaterScalarTransport.js";
import { shallowWaterVelocityDerivatives } from "./shallowWaterVelocityDerivatives.js";

/**
 * Advances secondary water fields by one solver substep.
 * @param {object} state Canonical shallow-water state containing grid geometry and policy.
 * @param {object} previousArrays Previous hydrodynamic and secondary arrays.
 * @param {object} nextHydro Newly evolved hydrodynamic arrays.
 * @param {number} deltaTime Substep duration.
 * @returns {{foam:number[], sediment:number[], wetness:number[]}} New passive field arrays.
 */
export function stepShallowWaterSecondaryFields(
	state,
	previousArrays,
	nextHydro,
	deltaTime
) {
	const transportKli = createTransportInput(state, nextHydro, deltaTime);
	const advectedFoam = advectShallowWaterScalar({
		...transportKli,
		values: previousArrays.foam
	});
	const advectedSediment = advectShallowWaterScalar({
		...transportKli,
		values: previousArrays.sediment
	});
	const foam = [];
	const sediment = [];
	const wetness = [];
	for (let indexOhr = 0; indexOhr < nextHydro.height.length; indexOhr += 1) {
		const evolvedKli = evolveCell(
			state,
			previousArrays,
			nextHydro,
			advectedFoam,
			advectedSediment,
			indexOhr,
			deltaTime
		);
		foam.push(evolvedKli.foam);
		sediment.push(evolvedKli.sediment);
		wetness.push(evolvedKli.wetness);
	}
	return { foam, sediment, wetness };
}

/** Creates the common advection input for every transported passive scalar. */
function createTransportInput(state, nextHydro, deltaTime) {
	return {
		cellSize: state.height.cellSize,
		deltaTime,
		height: state.height.height,
		velocityX: nextHydro.velocityX,
		velocityY: nextHydro.velocityY,
		width: state.height.width
	};
}

/** Evolves one passive-field cell from transported values and current flow intensity. */
function evolveCell(
	state,
	previousArrays,
	nextHydro,
	advectedFoam,
	advectedSediment,
	indexOhr,
	deltaTime
) {
	const depthOhr = Math.max(0, Number(nextHydro.height[indexOhr]) || 0);
	const speedOhr = Math.hypot(
		Number(nextHydro.velocityX[indexOhr]) || 0,
		Number(nextHydro.velocityY[indexOhr]) || 0
	);
	return evolveShallowWaterSecondaryCell({
		deltaTime,
		depth: depthOhr,
		derivatives: shallowWaterVelocityDerivatives(state, nextHydro, indexOhr),
		foam: advectedFoam[indexOhr],
		sediment: advectedSediment[indexOhr],
		speed: speedOhr,
		state,
		wetness: previousArrays.wetness[indexOhr]
	});
}
