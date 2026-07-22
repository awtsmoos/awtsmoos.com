// B"H
// Boruch Hashem
// Blessed is He
/** A bounded frame plan protects continuity, stability, and visible surface detail. */

import { resolveRealtimeLiquidQualityTier } from "./realtimeQualityTiers.js";

function maximumParticleSpeed(state) {
	let maximum = 0;
	for (const particle of state.particleSystem.particles) {
		maximum = Math.max(maximum, Math.hypot(...particle.velocity));
	}
	return maximum;
}

export function planRealtimeLiquidFrame3d(input) {
	const profile = input.profile;
	const tier = resolveRealtimeLiquidQualityTier(input.qualityState.qualityIndex);
	const requestedDelta = Math.max(0, Number(input.frameDeltaSeconds ?? 0));
	const simulationDeltaSeconds = Math.min(
		requestedDelta,
		profile.maxFrameDeltaSeconds
	);
	const maximumSpeed = maximumParticleSpeed(input.state);
	const stableSubsteps = Math.max(1, Math.ceil(
		maximumSpeed * simulationDeltaSeconds
		/ Math.max(input.state.grid.cellSize * profile.targetCfl, 1e-9)
	));
	const substeps = Math.min(
		stableSubsteps,
		tier.maxSubsteps,
		profile.maxCatchUpSteps
	);
	const frameIndex = Math.max(0, Math.floor(input.frameIndex ?? 0));
	const surfaceRebuild = profile.surfaceEnabled && (
		input.hasSurface !== true
		|| frameIndex % tier.surfaceCadence === 0
	);
	return Object.freeze({
		schema: "awtsmoos.realtime-liquid-frame-plan-3d",
		frameIndex,
		qualityId: tier.id,
		requestedDeltaSeconds: requestedDelta,
		simulationDeltaSeconds,
		droppedDeltaSeconds: Math.max(0, requestedDelta - simulationDeltaSeconds),
		substeps,
		pressureIterations: tier.pressureIterations,
		surfaceRebuild,
		surfaceCellSize: input.state.grid.cellSize * tier.surfaceCellScale,
		maxSurfaceCells: tier.maxSurfaceCells,
		maxTriangles: tier.maxTriangles,
		maximumSpeed,
		frameBudgetMs: profile.frameBudgetMs
	});
}
