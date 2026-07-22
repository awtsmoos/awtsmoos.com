// B"H
// Boruch Hashem
// Blessed is He
/** Runtime evidence proves persistent allocation, cached pipelines, one submit, and no readback. */

import assert from "node:assert/strict";
import { createParticleSystem } from "../src/core/proceduralObject/particles/createParticleSystem.js";
import { WebGpuLiquidRuntime3d } from "../src/core/proceduralObject/webgpu3d/index.js";
import { createRecordingWebGpuDevice } from "./helpers/createRecordingWebGpuDevice.mjs";

const recording = createRecordingWebGpuDevice();
const particleSystem = createParticleSystem({
	particles: [
		{ id: "a", position: [-0.2, 0, 0], velocity: [1, 0, 0], size: 0.1, lifetime: 10 },
		{ id: "b", position: [0.2, 0, 0], velocity: [-1, 0, 0], size: 0.1, lifetime: 10 }
	]
});
const runtime = new WebGpuLiquidRuntime3d({
	device: recording.device,
	usageConstants: recording.usageConstants,
	particleSystem,
	particleCapacity: 16,
	gridCellCount: 128,
	boundsMin: [-1, -1, -1],
	boundsMax: [1, 1, 1]
});
assert.equal(recording.calls.buffers.length, 5);
assert.equal(recording.calls.writeBuffers.length, 2);
assert.equal(recording.calls.shaderModules.length, 1);

const first = runtime.stepFrame({ deltaTime: 1 / 60 });
assert.equal(first.frameIndex, 0);
assert.equal(first.parity, 1);
assert.equal(first.pipelineCount, 2);
assert.equal(first.bindGroupCount, 2);
assert.equal(first.computePassCount, 2);
assert.equal(first.submissionCount, 1);
assert.equal(first.readbackCount, 0);
assert.equal(recording.calls.submissions.length, 1);
assert.equal(recording.calls.writeBuffers.length, 3);
assert.equal(recording.calls.dispatches.length, 2);

const second = runtime.stepFrame({ deltaTime: 1 / 60 });
assert.equal(second.frameIndex, 1);
assert.equal(second.parity, 0);
assert.equal(second.pipelineCount, 2);
assert.equal(second.bindGroupCount, 4);
assert.equal(recording.calls.pipelines.length, 2);
assert.equal(recording.calls.bindGroups.length, 4);
assert.equal(recording.calls.submissions.length, 2);
assert.equal(recording.calls.dispatches.length, 4);

const third = runtime.stepFrame({ deltaTime: 1 / 60 });
assert.equal(third.parity, 1);
assert.equal(third.bindGroupCount, 4);
assert.equal(recording.calls.pipelines.length, 2);
assert.equal(recording.calls.bindGroups.length, 4);
assert.equal(recording.calls.encoders.length, 3);
assert.equal(recording.calls.computePasses.length, 3);
assert.equal(recording.calls.pipelineSets.length, 6);
assert.equal(recording.calls.bindGroupSets.length, 6);
assert.equal(recording.calls.dispatches.length, 6);
for (const encoder of recording.calls.encoders) {
	assert.equal(encoder.passCount, 1);
	assert.equal(encoder.finished, true);
}
for (const pass of recording.calls.computePasses) {
	assert.equal(pass.ended, true);
}
assert.equal(recording.calls.mapAsyncCount, 0);

recording.lose({ reason: "destroyed", message: "test loss" });
await new Promise(resolve => setImmediate(resolve));
const lost = runtime.stepFrame({ deltaTime: 1 / 60 });
assert.equal(lost.ok, false);
assert.equal(lost.state.status, "lost");
assert.equal(recording.calls.submissions.length, 3);

console.log('B"H | proceduralObjectWebGpuRuntime3d.test passed');
