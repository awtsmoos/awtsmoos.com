// B"H
// Boruch Hashem
// Blessed is He
/** Runtime evidence proves resident pressure projection, bounded iteration, and no readback. */

import assert from "node:assert/strict";
import { createParticleSystem } from "../src/core/proceduralObject/particles/createParticleSystem.js";
import { WebGpuLiquidRuntime3d } from "../src/core/proceduralObject/webgpu3d/index.js";
import { createRecordingWebGpuDevice } from "./helpers/createRecordingWebGpuDevice.mjs";

function createTestParticles() {
	return createParticleSystem({
		particles: [
			{ id: "a", position: [-0.2, 0, 0], velocity: [1, 0, 0], size: 0.1, lifetime: 10 },
			{ id: "b", position: [0.2, 0, 0], velocity: [-1, 0, 0], size: 0.1, lifetime: 10 }
		]
	});
}

const recording = createRecordingWebGpuDevice();
const runtime = new WebGpuLiquidRuntime3d({
	device: recording.device,
	usageConstants: recording.usageConstants,
	particleSystem: createTestParticles(),
	particleCapacity: 4,
	gridCellCount: 128,
	gridDimensions: [8, 4, 4],
	gridOrigin: [-1, -1, -1],
	gridCellSize: 0.25,
	maximumBytes: 8192,
	maximumWorkgroups: 64,
	boundsMin: [-1, -1, -1],
	boundsMax: [1, 1, 1]
});
assert.equal(recording.records.buffers.length, 9);
assert.equal(recording.records.writes.length, 2);
assert.equal(runtime.capabilities.implemented.collocatedPressureProjection, true);
assert.equal(runtime.capabilities.implemented.macPressureProjection, false);

const first = runtime.stepFrame({
	deltaTime: 1 / 60,
	picBlend: 0.95,
	pressureIterations: 8,
	fluidDensity: 1000,
	pressureRelaxation: 1
});
assert.equal(first.ok, true);
assert.equal(first.pressureIterations, 8);
assert.equal(first.parity, 1);
assert.equal(first.dispatchCount, 15);
assert.equal(first.totalWorkgroups, 28);
assert.equal(first.submissionCount, 1);
assert.equal(first.readbackCount, 0);
assert.equal(first.pipelineCount, 9);
assert.equal(first.bindGroupCount, 9);
assert.equal(recording.records.buffers.length, 9);
assert.equal(recording.records.submissions.length, 1);
assert.equal(recording.records.dispatches.length, 15);

const second = runtime.stepFrame({
	deltaTime: 1 / 60,
	pressureIterations: 8
});
assert.equal(second.parity, 0);
assert.equal(second.pipelineCount, 9);
assert.equal(second.bindGroupCount, 11);
assert.equal(recording.records.pipelines.length, 9);
assert.equal(recording.records.bindGroups.length, 11);
assert.equal(recording.records.buffers.length, 9);
assert.equal(recording.records.submissions.length, 2);

const third = runtime.stepFrame({
	deltaTime: 1 / 60,
	pressureIterations: 8
});
assert.equal(third.parity, 1);
assert.equal(third.bindGroupCount, 11);
assert.equal(recording.records.buffers.length, 9);
assert.equal(recording.records.writes.length, 5);
assert.equal(recording.records.submissions.length, 3);
assert.equal(runtime.frameIndex, 3);

const rejected = createRecordingWebGpuDevice();
assert.throws(() => new WebGpuLiquidRuntime3d({
	device: rejected.device,
	usageConstants: rejected.usageConstants,
	particleSystem: createTestParticles(),
	particleCapacity: 100,
	gridCellCount: 100,
	maximumBytes: 100
}), /exceed total byte budget/);
assert.equal(rejected.records.buffers.length, 0);

console.log('B"H | proceduralObjectWebGpuRuntime3d.test passed');
