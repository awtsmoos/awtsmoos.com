// B"H
// Boruch Hashem
// Blessed is He
/** Realtime runtime evidence proves measured frames, cached surfaces, and adaptation. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

function createState() {
	return api.createParticleGridLiquidState({
		grid: {
			width: 9,
			height: 9,
			depth: 9,
			origin: [-1, -1, -1],
			cellSize: 0.25
		},
		particleSystem: {
			particles: [
				{ id: "a", position: [-0.2, 0, 0], velocity: [0.1, 0, 0], size: 0.3, lifetime: 10 },
				{ id: "b", position: [0.2, 0, 0], velocity: [-0.1, 0, 0], size: 0.3, lifetime: 10 }
			]
		}
	});
}

const clockValues = [0, 2, 5, 5, 7, 7];
const runtime = new api.RealtimeLiquidRuntime3d({
	state: createState(),
	profile: {
		initialQuality: "minimal",
		minimumQuality: "minimal",
		maximumQuality: "minimal",
		adaptive: false
	},
	clock: () => clockValues.shift(),
	simulationOptions: {
		gravity: [0, 0, 0],
		pressureIterationCandidates: []
	}
});
const first = runtime.stepFrame(1 / 60);
const second = runtime.stepFrame(1 / 60);
assert.equal(first.frameIndex, 0);
assert.equal(second.frameIndex, 1);
assert.equal(first.telemetry.surfaceRebuilt, true);
assert.equal(first.telemetry.totalMs, 5);
assert.equal(second.telemetry.cachedSurface, true);
assert.equal(second.telemetry.surfaceMs, 0);
assert.equal(first.surface, second.surface);
assert.ok(first.telemetry.budgetMs > 16 && first.telemetry.budgetMs < 17);

const slowClock = [0, 25, 25, 25, 50, 50];
const adaptive = new api.RealtimeLiquidRuntime3d({
	state: createState(),
	profile: {
		surfaceEnabled: false,
		initialQuality: "high",
		minimumQuality: "performance",
		maximumQuality: "high",
		downgradeFrames: 2,
		cooldownFrames: 0,
		ewmaAlpha: 1
	},
	clock: () => slowClock.shift(),
	simulationOptions: {
		gravity: [0, 0, 0],
		pressureIterationCandidates: []
	}
});
adaptive.stepFrame(1 / 60, { surface: false });
const degraded = adaptive.stepFrame(1 / 60, { surface: false });
assert.equal(degraded.qualityState.qualityId, "balanced");
assert.equal(degraded.telemetry.missedBudget, true);

const longFramePlan = api.planRealtimeLiquidFrame3d({
	profile: adaptive.profile,
	qualityState: adaptive.qualityState,
	state: adaptive.state,
	frameIndex: adaptive.frameIndex,
	frameDeltaSeconds: 1,
	hasSurface: false
});
assert.ok(longFramePlan.simulationDeltaSeconds
	<= adaptive.profile.maxFrameDeltaSeconds);
assert.ok(longFramePlan.droppedDeltaSeconds > 0);

console.log('B"H | proceduralObjectRealtimeRuntime3d.test passed');
