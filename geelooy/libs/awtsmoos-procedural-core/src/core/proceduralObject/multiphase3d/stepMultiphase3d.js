// B"H
// Boruch Hashem
// Blessed is He
/**
 * Advection, phase exchange, buoyancy, drag, and pressure projection descend in
 * explicit stages. The Awtsmoos lets Awtsmoos.com measure every conservation loss.
 */
import { createScalarGrid3d, createVectorGrid3d } from "../volumes/grid3d.js";
import { advectScalarGrid3d, advectVectorGrid3d } from "../simulation3d/advectGrid3d.js";
import { projectVelocity3d } from "../simulation3d/projectVelocity3d.js";
import { createMultiphaseState3d } from "./createMultiphaseState3d.js";
import { exchangeMultiphaseCells3d } from "./exchangeMultiphaseCells3d.js";
import { measureMultiphaseState3d } from "./measureMultiphaseState3d.js";

function scalar(grid, values) {
	return createScalarGrid3d({ ...grid, values });
}

/** Advances one deterministic multiphase frame and reports conservation. */
export function stepMultiphase3d(state, input = {}) {
	const deltaTime = Math.max(0, Number(input.deltaTime ?? 1 / 60));
	const before = measureMultiphaseState3d(state);
	let velocity = advectVectorGrid3d(state.velocity, state.velocity, deltaTime, Number(input.velocityDissipation ?? 0.999));
	const advect = grid => advectScalarGrid3d(grid, velocity, deltaTime, Number(input.scalarDissipation ?? 1));
	const liquid = advect(state.liquidFraction);
	const gas = advect(state.gasFraction);
	const dissolved = advect(state.dissolvedGas);
	const temperature = advect(state.temperature);
	const soot = advect(state.soot);
	const exchange = exchangeMultiphaseCells3d({
		liquid: liquid.values,
		gas: gas.values,
		dissolved: dissolved.values,
		temperature: temperature.values
	}, state.properties, {
		deltaTime,
		evaporationRate: Number(input.evaporationRate ?? 0.9),
		condensationRate: Number(input.condensationRate ?? 0.7),
		exsolutionRate: Number(input.exsolutionRate ?? 1.4),
		solubility: Number(input.solubility ?? 0.12)
	});
	const nextX = [...velocity.x];
	const nextY = [...velocity.y];
	const nextZ = [...velocity.z];
	for (let index = 0; index < velocity.length; index += 1) {
		const thermal = exchange.temperature[index] - state.properties.ambientTemperature;
		const buoyancy = thermal * Number(input.thermalBuoyancy ?? 0.35)
			+ exchange.gas[index] * Number(input.gasBuoyancy ?? 0.55)
			- exchange.liquid[index] * Number(input.liquidWeight ?? 0.08);
		const drag = Math.max(0, 1 - Number(input.interphaseDrag ?? 0.08)
			* exchange.liquid[index] * exchange.gas[index] * deltaTime);
		nextX[index] *= drag;
		nextY[index] = (nextY[index] + buoyancy * deltaTime) * drag;
		nextZ[index] *= drag;
	}
	velocity = projectVelocity3d(createVectorGrid3d({ ...velocity, x: nextX, y: nextY, z: nextZ }), input.pressureIterations ?? 32);
	const nextState = createMultiphaseState3d({
		...state,
		tick: state.tick + 1,
		time: state.time + deltaTime,
		velocity,
		liquidFraction: scalar(liquid, exchange.liquid),
		gasFraction: scalar(gas, exchange.gas),
		dissolvedGas: scalar(dissolved, exchange.dissolved),
		temperature: scalar(temperature, exchange.temperature),
		soot
	});
	const after = measureMultiphaseState3d(nextState);
	return Object.freeze({
		state: nextState,
		report: Object.freeze({
			before,
			after,
			transfers: exchange.transfers,
			matterDelta: after.totalMatter - before.totalMatter,
			phaseVolumeDelta: after.totalPhaseVolume - before.totalPhaseVolume
		})
	});
}
