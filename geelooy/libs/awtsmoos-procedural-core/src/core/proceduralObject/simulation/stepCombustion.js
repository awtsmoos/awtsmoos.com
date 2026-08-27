// B"H
// Boruch Hashem
// Blessed is He
/** Combustion converts fuel to heat and smoke while projected flow carries both. */

import { advectScalarGrid2d, advectVectorGrid2d } from "./advectGrid2d.js";
import { createScalarGrid2d, createVectorGrid2d } from "./grid2d.js";
import { createCombustionState } from "./createCombustionState.js";
import { projectVelocity2d } from "./projectVelocity2d.js";

export function stepCombustion(state, options = {}) {
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const dissipation = Math.max(0, Math.min(1, Number(options.dissipation ?? 0.995)));
	let velocity = advectVectorGrid2d(state.velocity, state.velocity, deltaTime, Number(options.velocityDissipation ?? 0.999));
	let density = advectScalarGrid2d(state.density, velocity, deltaTime, dissipation);
	let temperature = advectScalarGrid2d(state.temperature, velocity, deltaTime, Number(options.cooling ?? 0.99));
	let fuel = advectScalarGrid2d(state.fuel, velocity, deltaTime, dissipation);
	const nextDensity = [];
	const nextTemperature = [];
	const nextFuel = [];
	const nextY = [...velocity.y];
	const burnRate = Math.max(0, Number(options.burnRate ?? 1));
	const ignition = Number(options.ignitionTemperature ?? 0.1);
	for (let index = 0; index < fuel.values.length; index += 1) {
		const available = temperature.values[index] >= ignition ? fuel.values[index] : 0;
		const burned = Math.min(available, burnRate * deltaTime);
		nextFuel.push(Math.max(0, fuel.values[index] - burned));
		nextTemperature.push(Math.max(0, temperature.values[index] + burned * Number(options.heatYield ?? 4)));
		nextDensity.push(Math.max(0, density.values[index] + burned * Number(options.smokeYield ?? 1)));
		nextY[index] += (temperature.values[index] * Number(options.buoyancy ?? 0.5)
			- density.values[index] * Number(options.smokeWeight ?? 0.05)) * deltaTime;
	}
	velocity = projectVelocity2d(createVectorGrid2d({ ...velocity, y: nextY }), options.pressureIterations ?? 20);
	density = createScalarGrid2d({ ...density, values: nextDensity });
	temperature = createScalarGrid2d({ ...temperature, values: nextTemperature });
	fuel = createScalarGrid2d({ ...fuel, values: nextFuel });
	return createCombustionState({ ...state, tick: state.tick + 1, time: state.time + deltaTime, velocity, density, temperature, fuel });
}
