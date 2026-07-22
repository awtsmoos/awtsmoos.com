// B"H
// Boruch Hashem
// Blessed is He
/**
 * Liquid stability is chosen from the actual particle river before the grid moves.
 * Awtsmoos.com translates maximum speed and cell scale into a deterministic CFL
 * plan while preserving explicit legacy substep requests and reporting clamping.
 */

import {
	createRealtimeQualityProfile,
	planAdaptiveSubsteps
} from "../realtimeQuality/index.js";
import { measureLiquidState3d } from "./measureLiquidState3d.js";

/**
 * Plans bounded particle-grid liquid substeps in O(particles).
 * @param {Object} state Canonical particle-grid liquid state.
 * @param {Object} options Frame time, quality, and optional explicit substeps.
 * @returns {Object} Immutable CFL plan and initial-state diagnostics.
 * @deterministic Always for equal canonical state and options.
 * @sideEffects None.
 * @resourceBehavior Clamps work to the quality profile's maximum substeps.
 */
export function planLiquidSubsteps3d(state, options = {}) {
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const metrics = measureLiquidState3d(state, { deltaTime });
	const profile = createRealtimeQualityProfile(
		options.qualityProfile ?? options.quality ?? "realtime"
	);
	const adaptive = options.adaptiveSubsteps !== false;
	const requestedSubsteps = options.substeps ?? (adaptive ? null : 1);
	const plan = planAdaptiveSubsteps({
		profile,
		deltaTime,
		maximumSpeed: metrics.maxSpeed,
		characteristicLength: state.grid.cellSize,
		targetRatio: options.targetCfl ?? profile.targetCfl,
		requestedSubsteps
	});
	return Object.freeze({
		...plan,
		metric: "cfl",
		initialCfl: metrics.cfl,
		initialParticleCount: metrics.particleCount,
		initialKineticEnergy: metrics.kineticEnergy
	});
}
