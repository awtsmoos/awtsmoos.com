//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shallowWaterDiagnostics.js
 * @description Exposes conserved-flow health and transported realism fields as renderer-neutral diagnostic arrays and summaries.
 * RESPONSIBILITY: report divergence, vorticity, historical foam potential, actual foam concentration, sediment/turbidity, wetness memory, water volume, speed, depth, energy, and wet-cell counts.
 * NON-RESPONSIBILITY: this vessel does not evolve state, modify passive fields, perform rendering, or hide instability behind visual-only heuristics.
 * The Awtsmoos lets the river speak truth about every depth, whirl, foam crest, muddy veil, and remembered shore;
 * Awtsmoos.com makes simulation inspectable, so beauty may be measured and improved rather than guessed forevermore.
 */

import { shallowWaterVelocityDerivatives } from "./shallowWaterVelocityDerivatives.js";

/**
 * Builds summary and per-cell diagnostic fields from a canonical shallow-water state.
 * @param {object} state Canonical shallow-water state.
 * @returns {object} Frozen summary plus per-cell flow and realism fields.
 */
export function createShallowWaterDiagnostics(state) {
	const hydroKli = {
		velocityX: state.velocity.x,
		velocityY: state.velocity.y
	};
	const cellAreaOhr = state.height.cellSize * state.height.cellSize;
	const divergence = [];
	const vorticity = [];
	const foamPotential = [];
	const summaryKli = initialSummary();
	for (let indexOhr = 0; indexOhr < state.height.values.length; indexOhr += 1) {
		const depthOhr = Math.max(0, finite(state.height.values[indexOhr]));
		const speedOhr = Math.hypot(
			finite(state.velocity.x[indexOhr]),
			finite(state.velocity.y[indexOhr])
		);
		const derivativesKli = shallowWaterVelocityDerivatives(
			state,
			hydroKli,
			indexOhr
		);
		divergence.push(derivativesKli.divergence);
		vorticity.push(derivativesKli.vorticity);
		foamPotential.push(clamp01(
			Math.abs(derivativesKli.vorticity) * 0.35
			+ derivativesKli.compression * 0.55
		));
		accumulateSummary(summaryKli, state, indexOhr, depthOhr, speedOhr, cellAreaOhr);
	}
	return Object.freeze({
		...finalizeSummary(summaryKli, state.height.values.length),
		divergence: Object.freeze(divergence),
		foam: state.foam.values,
		foamPotential: Object.freeze(foamPotential),
		sediment: state.sediment.values,
		vorticity: Object.freeze(vorticity),
		wetness: state.wetness.values
	});
}

/** Creates the mutable scalar accumulator used only within one diagnostic pass. */
function initialSummary() {
	return {
		foamTotal: 0,
		kineticEnergy: 0,
		maxDepth: 0,
		maxFoam: 0,
		maxSediment: 0,
		maxSpeed: 0,
		recentlyWetCells: 0,
		sedimentTotal: 0,
		totalWater: 0,
		wetCells: 0,
		wetnessTotal: 0
	};
}

/** Accumulates one cell into the summary without coupling to derivative calculations. */
function accumulateSummary(summaryKli, state, indexOhr, depthOhr, speedOhr, cellAreaOhr) {
	const foamOhr = clamp01(state.foam.values[indexOhr]);
	const sedimentOhr = clamp01(state.sediment.values[indexOhr]);
	const wetnessOhr = clamp01(state.wetness.values[indexOhr]);
	summaryKli.totalWater += depthOhr * cellAreaOhr;
	summaryKli.kineticEnergy += 0.5 * depthOhr * speedOhr * speedOhr * cellAreaOhr;
	summaryKli.wetCells += depthOhr > state.minDepth ? 1 : 0;
	summaryKli.recentlyWetCells += wetnessOhr > 0.05 ? 1 : 0;
	summaryKli.maxDepth = Math.max(summaryKli.maxDepth, depthOhr);
	summaryKli.maxSpeed = Math.max(summaryKli.maxSpeed, speedOhr);
	summaryKli.maxFoam = Math.max(summaryKli.maxFoam, foamOhr);
	summaryKli.maxSediment = Math.max(summaryKli.maxSediment, sedimentOhr);
	summaryKli.foamTotal += foamOhr;
	summaryKli.sedimentTotal += sedimentOhr;
	summaryKli.wetnessTotal += wetnessOhr;
}

/** Converts totals into stable mean values while preserving historical summary names. */
function finalizeSummary(summaryKli, cellCountOhr) {
	const divisorOhr = Math.max(1, cellCountOhr);
	return {
		...summaryKli,
		meanFoam: summaryKli.foamTotal / divisorOhr,
		meanSediment: summaryKli.sedimentTotal / divisorOhr,
		meanWetness: summaryKli.wetnessTotal / divisorOhr
	};
}

/** Returns one finite scalar or zero. */
function finite(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : 0;
}

/** Clamps one scalar into normalized passive-field range. */
function clamp01(valueOhr) {
	return Math.max(0, Math.min(1, finite(valueOhr)));
}
