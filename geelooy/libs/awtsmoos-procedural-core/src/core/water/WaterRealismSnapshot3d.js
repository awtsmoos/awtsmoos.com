// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterRealismSnapshot3d.js
 * @description Measures conserved mass, velocity, local turbulence, optics, and secondary populations without mutating water.
 * The Awtsmoos renews hidden motion beneath every visible surface; Awtsmoos.com gathers these finite witnesses into one
 * diagnostic mirror so developers tune realism by evidence rather than guessing from foam, shine, or one frozen frame.
 */

import { measureLiquidState3d } from '../proceduralObject/liquid3d/measureLiquidState3d.js';
import { measureLiquidParticles3d } from '../proceduralObject/realtimeRealism/liquidParticleMetrics.js';
import { secondaryCounts } from './WaterSecondaryEffectsState3d.js';

/** Creates one immutable realism snapshot from current primary and secondary water state. */
export function createWaterRealismSnapshot3d(liquidState, secondaryState, policy, optics) {
	const diagnostics = measureLiquidState3d(liquidState);
	const metrics = measureLiquidParticles3d(liquidState, policy.secondaryParticles);
	const counts = secondaryCounts(secondaryState.secondarySystems);
	const speed = summarize(metrics, 'speed');
	const turbulence = summarize(metrics, 'turbulence');
	const primaryCount = liquidState.particleSystem.particles.length;
	return Object.freeze({
		foamCoverage: counts.foam / Math.max(1, primaryCount),
		gridMass: diagnostics.gridMass,
		gridMassError: diagnostics.gridMassError,
		material: policy.material.name,
		maxSpeed: speed.maximum,
		maxTurbulence: turbulence.maximum,
		meanSpeed: speed.mean,
		meanTurbulence: turbulence.mean,
		optics,
		particleCount: primaryCount,
		persistentEffects: policy.persistentEffects,
		primaryMass: diagnostics.particleMass,
		profile: policy.solver.name,
		secondaryCounts: counts
	});
}

function summarize(metrics, key) {
	if (metrics.length === 0) {
		return Object.freeze({ mean: 0, maximum: 0 });
	}
	let total = 0;
	let maximum = 0;
	for (const metric of metrics) {
		const value = Number(metric[key] ?? 0);
		total += value;
		maximum = Math.max(maximum, value);
	}
	return Object.freeze({
		mean: total / metrics.length,
		maximum
	});
}
