// B"H
// Boruch Hashem
// Blessed is He
/** Fuel burns into heat and smoke while projected three-dimensional flow carries both. */

import { createScalarGrid3d, createVectorGrid3d } from "../volumes/grid3d.js";
import { advectScalarGrid3d, advectVectorGrid3d } from "./advectGrid3d.js";
import { createCombustionState3d } from "./createCombustionState3d.js";
import { projectVelocity3d } from "./projectVelocity3d.js";

export function stepCombustion3d(state, options = {}) {
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const scalarDissipation = Math.max(0, Math.min(1, Number(options.dissipation ?? 0.995)));
	let velocity = advectVectorGrid3d(
		state.velocity,
		state.velocity,
		deltaTime,
		Number(options.velocityDissipation ?? 0.999)
	);
	let density = advectScalarGrid3d(state.density, velocity, deltaTime, scalarDissipation);
	let temperature = advectScalarGrid3d(
		state.temperature,
		velocity,
		deltaTime,
		Number(options.cooling ?? 0.99)
	);
	let fuel = advectScalarGrid3d(state.fuel, velocity, deltaTime, scalarDissipation);
	const nextDensity = [];
	const nextTemperature = [];
	const nextFuel = [];
	const nextY = [...velocity.y];
	const burnRate = Math.max(0, Number(options.burnRate ?? 1));
	const ignition = Number(options.ignitionTemperature ?? 0.1);
	for (let index = 0; index < fuel.length; index += 1) {
		const available = temperature.values[index] >= ignition ? fuel.values[index] : 0;
		const burned = Math.min(available, burnRate * deltaTime);
		const smoke = density.values[index] + burned * Number(options.smokeYield ?? 1);
		const heat = temperature.values[index] + burned * Number(options.heatYield ?? 4);
		nextFuel.push(Math.max(0, fuel.values[index] - burned));
		nextDensity.push(Math.max(0, smoke));
		nextTemperature.push(Math.max(0, heat));
		nextY[index] += (
			heat * Number(options.buoyancy ?? 0.5)
			- smoke * Number(options.smokeWeight ?? 0.05)
		) * deltaTime;
	}
	velocity = projectVelocity3d(
		createVectorGrid3d({ ...velocity, y: nextY }),
		options.pressureIterations ?? 32
	);
	density = createScalarGrid3d({ ...density, values: nextDensity });
	temperature = createScalarGrid3d({ ...temperature, values: nextTemperature });
	fuel = createScalarGrid3d({ ...fuel, values: nextFuel });
	return createCombustionState3d({
		...state,
		tick: state.tick + 1,
		time: state.time + deltaTime,
		velocity,
		density,
		temperature,
		fuel
	});
}
