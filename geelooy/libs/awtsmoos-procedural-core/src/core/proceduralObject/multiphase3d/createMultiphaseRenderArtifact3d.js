// B"H
// Boruch Hashem
// Blessed is He
/** Sparse fields expose liquid, vapor, soot, heat, absorption, and emission. */
import { createScalarGrid3d } from "../volumes/grid3d.js";
import { createSparseScalarBrickGrid3dFromDense } from "../volumes/sparseBrickGrid3d.js";

function sparse(grid, options) {
	return createSparseScalarBrickGrid3dFromDense(grid, {
		brickSize: options.brickSize ?? 8,
		threshold: options.threshold ?? 1e-5,
		background: 0
	});
}

/** Creates backend-neutral sparse volume channels from one multiphase state. */
export function createMultiphaseRenderArtifact3d(state, options = {}) {
	const emissionValues = state.temperature.values.map((temperature, index) => (
		Math.max(0, temperature - state.properties.ambientTemperature)
			* (state.gasFraction.values[index] + state.soot.values[index])
	));
	const absorptionValues = state.liquidFraction.values.map((liquid, index) => (
		liquid * Number(options.liquidAbsorption ?? 0.18)
			+ state.soot.values[index] * Number(options.sootAbsorption ?? 2.4)
	));
	const emission = createScalarGrid3d({ ...state.temperature, values: emissionValues });
	const absorption = createScalarGrid3d({ ...state.temperature, values: absorptionValues });
	return Object.freeze({
		schema: "awtsmoos.multiphase-render-artifact-3d",
		sourceStateId: state.id,
		tick: state.tick,
		liquid: sparse(state.liquidFraction, options),
		vapor: sparse(state.gasFraction, options),
		soot: sparse(state.soot, options),
		temperature: sparse(state.temperature, options),
		emission: sparse(emission, options),
		absorption: sparse(absorption, options),
		phaseFunction: Object.freeze({
			type: options.phaseFunction ?? "henyey-greenstein",
			anisotropy: Number(options.anisotropy ?? 0.25)
		})
	});
}
