// B"H
// Boruch Hashem
// Blessed is He
/** Fire fields become sparse density, fuel, heat, absorption, and blackbody emission. */
import { createScalarGrid3d } from "./grid3d.js";
import { createSparseScalarBrickGrid3dFromDense } from "./sparseBrickGrid3d.js";

function sparse(grid, options) {
	return createSparseScalarBrickGrid3dFromDense(grid, {
		brickSize: options.brickSize ?? 8,
		threshold: options.threshold ?? 1e-5,
		background: 0
	});
}

/** Creates a renderer-neutral combustion volume package. */
export function createCombustionVolumeArtifact3d(state, options = {}) {
	const emission = createScalarGrid3d({
		...state.temperature,
		values: state.temperature.values.map((temperature, index) => (
			Math.max(0, temperature - Number(options.emissionThreshold ?? 0.15))
				* (1 + state.fuel.values[index] * Number(options.fuelGlow ?? 0.8))
		))
	});
	const absorption = createScalarGrid3d({
		...state.density,
		values: state.density.values.map(value => value * Number(options.absorptionScale ?? 1.6))
	});
	return Object.freeze({
		schema: "awtsmoos.combustion-volume-artifact-3d",
		sourceStateId: state.id,
		tick: state.tick,
		density: sparse(state.density, options),
		fuel: sparse(state.fuel, options),
		temperature: sparse(state.temperature, options),
		emission: sparse(emission, options),
		absorption: sparse(absorption, options),
		blackbody: Object.freeze({
			enabled: true,
			temperatureScale: Number(options.temperatureScale ?? 1800),
			intensity: Number(options.intensity ?? 1)
		})
	});
}
