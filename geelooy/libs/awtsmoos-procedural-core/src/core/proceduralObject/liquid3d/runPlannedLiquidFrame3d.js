// B"H
// Boruch Hashem
// Blessed is He
/**
 * One planned liquid frame runs bounded PIC/FLIP substeps and aggregates solver
 * evidence. The Awtsmoos renews each interval; Awtsmoos.com keeps the orchestration
 * focused so the public step facade remains small, readable, and deterministic.
 */

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

/**
 * Runs the declared liquid substep plan in O(substeps × solver work).
 * @param {Object} state Canonical particle-grid liquid state.
 * @param {Object} options Solver, collision, and quality options.
 * @param {Object} plan Adaptive or explicit substep plan.
 * @returns {Object} Unsealed next buffers and aggregated diagnostics.
 * @deterministic Always for equal state, options, and plan.
 * @sideEffects None.
 */
export function runPlannedLiquidFrame3d(state, options, plan) {
	const substepTime = plan.deltaTime / plan.substeps;
	const blend = options.blend ?? state.blend;
	const solidColliders = options.solidColliders ?? [];
	const solverOptions = {
		...options,
		pressureIterations: options.pressureIterations
			?? plan.profile.pressureIterations
	};
	let particleSystem = state.particleSystem;
	let massGrid = state.massGrid;
	let velocityGrid = state.velocityGrid;
	let previousVelocityGrid = state.previousVelocityGrid;
	let report = emptySubstepReport();
	for (let step = 0; step < plan.substeps; step += 1) {
		const result = runLiquidSubstep3d({
			particleSystem,
			grid: state.grid,
			blend,
			solidColliders,
			deltaTime: substepTime,
			options: solverOptions
		});
		particleSystem = result.particleSystem;
		massGrid = result.massGrid;
		velocityGrid = result.velocityGrid;
		previousVelocityGrid = result.previousVelocityGrid;
		report = mergeSubstepReport(report, result.report);
	}
	return {
		particleSystem,
		massGrid,
		velocityGrid,
		previousVelocityGrid,
		report,
		blend
	};
}
