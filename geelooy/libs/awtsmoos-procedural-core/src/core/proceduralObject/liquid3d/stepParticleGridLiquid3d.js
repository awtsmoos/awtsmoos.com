// B"H
// Boruch Hashem
// Blessed is He
/** Repeated bounded substeps renew one deterministic liquid state. */

import { createParticleSystem } from "../particles/createParticleSystem.js";
import { createLiquidSurface3d } from "./createLiquidSurface3d.js";
import { createParticleGridLiquidState } from "./createParticleGridLiquidState.js";
import { measureLiquidState3d } from "./measureLiquidState3d.js";
import { runLiquidSubstep3d } from "./runLiquidSubstep3d.js";

function emptySubstepReport() {
	return {
		activeCellCount: 0,
		divergenceBefore: 0,
		divergenceAfter: 0,
		projectionAccepted: false,
		acceptedIterations: 0,
		solidContactCount: 0,
		solidProjectedParticleEvents: 0,
		solidConstrainedCellCount: 0,
		solidInteriorCellCount: 0
	};
}

function mergeSubstepReport(total, current) {
	return {
		...current,
		solidContactCount: total.solidContactCount + current.solidContactCount,
		solidProjectedParticleEvents: total.solidProjectedParticleEvents
			+ current.solidProjectedParticleEvents,
		solidConstrainedCellCount: total.solidConstrainedCellCount
			+ current.solidConstrainedCellCount,
		solidInteriorCellCount: total.solidInteriorCellCount
			+ current.solidInteriorCellCount
	};
}

export function stepParticleGridLiquid3d(input, options = {}) {
	const state = createParticleGridLiquidState(input);
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const substeps = Math.max(1, Math.floor(options.substeps ?? 1));
	const substepTime = deltaTime / substeps;
	const blend = options.blend ?? state.blend;
	const solidColliders = options.solidColliders ?? [];
	let particleSystem = state.particleSystem;
	let massGrid = state.massGrid;
	let velocityGrid = state.velocityGrid;
	let previousVelocityGrid = state.previousVelocityGrid;
	let substepReport = emptySubstepReport();
	for (let step = 0; step < substeps; step += 1) {
		const result = runLiquidSubstep3d({
			particleSystem,
			grid: state.grid,
			blend,
			solidColliders,
			deltaTime: substepTime,
			options
		});
		particleSystem = result.particleSystem;
		massGrid = result.massGrid;
		velocityGrid = result.velocityGrid;
		previousVelocityGrid = result.previousVelocityGrid;
		substepReport = mergeSubstepReport(substepReport, result.report);
	}
	particleSystem = createParticleSystem({
		...particleSystem,
		tick: state.particleSystem.tick + 1,
		time: state.particleSystem.time + deltaTime
	});
	const nextState = createParticleGridLiquidState({
		...state,
		tick: state.tick + 1,
		time: state.time + deltaTime,
		particleSystem,
		massGrid,
		velocityGrid,
		previousVelocityGrid,
		blend
	});
	const surfaceOptions = options.surface === true ? {} : options.surface;
	return Object.freeze({
		state: nextState,
		surface: surfaceOptions
			? createLiquidSurface3d(nextState, surfaceOptions)
			: null,
		report: Object.freeze({
			...measureLiquidState3d(nextState, { deltaTime }),
			...substepReport,
			substeps
		})
	});
}
