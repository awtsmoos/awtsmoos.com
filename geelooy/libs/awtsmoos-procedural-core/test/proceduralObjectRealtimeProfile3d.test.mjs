// B"H
// Boruch Hashem
// Blessed is He
/** Realtime profile evidence proves explicit budgets, bounded work, and hysteresis. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const profile = api.createRealtimeLiquidProfile3d({ targetFps: 60 });
assert.ok(Math.abs(profile.frameBudgetMs - 1000 / 60) < 1e-12);
assert.equal(profile.targetFps, 60);

for (let index = 1; index < api.REALTIME_LIQUID_QUALITY_TIERS.length; index += 1) {
	const previous = api.REALTIME_LIQUID_QUALITY_TIERS[index - 1];
	const current = api.REALTIME_LIQUID_QUALITY_TIERS[index];
	assert.ok(current.pressureIterations >= previous.pressureIterations);
	assert.ok(current.maxSubsteps >= previous.maxSubsteps);
	assert.ok(current.maxSurfaceCells >= previous.maxSurfaceCells);
	assert.ok(current.maxTriangles >= previous.maxTriangles);
}

const state = api.createParticleGridLiquidState({
	grid: {
		width: 9,
		height: 9,
		depth: 9,
		origin: [-1, -1, -1],
		cellSize: 0.25
	},
	particleSystem: {
		particles: [{
			id: "fast",
			position: [0, 0, 0],
			velocity: [20, 0, 0],
			lifetime: 10
		}]
	}
});
const qualityState = api.createRealtimeQualityState3d(profile);
const plan = api.planRealtimeLiquidFrame3d({
	profile,
	qualityState,
	state,
	frameIndex: 0,
	frameDeltaSeconds: 0.2,
	hasSurface: false
});
assert.equal(plan.simulationDeltaSeconds, profile.maxFrameDeltaSeconds);
assert.ok(plan.droppedDeltaSeconds > 0);
assert.ok(plan.substeps <= profile.maxCatchUpSteps);
assert.equal(plan.surfaceRebuild, true);

const adaptive = api.createRealtimeLiquidProfile3d({
	initialQuality: "balanced",
	minimumQuality: "minimal",
	maximumQuality: "high",
	downgradeFrames: 2,
	upgradeFrames: 2,
	cooldownFrames: 0,
	ewmaAlpha: 1
});
let adaptiveState = api.createRealtimeQualityState3d(adaptive);
const slow = api.createRealtimeTelemetry3d({
	profile: adaptive,
	qualityId: "balanced",
	totalMs: 40
});
adaptiveState = api.updateRealtimeQuality3d(adaptiveState, slow, adaptive);
adaptiveState = api.updateRealtimeQuality3d(adaptiveState, slow, adaptive);
assert.equal(adaptiveState.qualityId, "performance");
const fast = api.createRealtimeTelemetry3d({
	profile: adaptive,
	qualityId: "performance",
	totalMs: 1
});
adaptiveState = api.updateRealtimeQuality3d(adaptiveState, fast, adaptive);
adaptiveState = api.updateRealtimeQuality3d(adaptiveState, fast, adaptive);
assert.equal(adaptiveState.qualityId, "balanced");

console.log('B"H | proceduralObjectRealtimeProfile3d.test passed');
