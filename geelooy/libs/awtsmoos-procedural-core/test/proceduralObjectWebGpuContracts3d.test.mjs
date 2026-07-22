// B"H
// Boruch Hashem
// Blessed is He
/** WebGPU contract evidence proves alignment, budgets, hashes, features, and dispatch. */

import assert from "node:assert/strict";
import {
	alignWebGpuBytes,
	createWebGpuBufferDescriptor3d,
	createWebGpuCapabilityReport3d,
	createWebGpuComputePass3d,
	createWebGpuLiquidFramePlan3d,
	createWebGpuShaderManifest3d,
	WEB_GPU_LIQUID_WGSL
} from "../src/core/proceduralObject/webgpu3d/index.js";
import { MOCK_GPU_BUFFER_USAGE } from "./helpers/createRecordingWebGpuDevice.mjs";

assert.equal(alignWebGpuBytes(17, 16), 32);
const descriptor = createWebGpuBufferDescriptor3d({
	label: "contract-buffer",
	size: 17,
	alignment: 16,
	maximumBytes: 64,
	usageNames: ["COPY_DST", "STORAGE"]
});
assert.equal(descriptor.size, 32);
assert.equal(
	descriptor.toHostDescriptor(MOCK_GPU_BUFFER_USAGE).usage,
	MOCK_GPU_BUFFER_USAGE.COPY_DST | MOCK_GPU_BUFFER_USAGE.STORAGE
);
assert.throws(() => createWebGpuBufferDescriptor3d({
	size: 65,
	maximumBytes: 64,
	usageNames: ["STORAGE"]
}), /exceeds byte budget/);

const report = createWebGpuCapabilityReport3d({
	available: true,
	features: ["timestamp-query"],
	requiredFeatures: ["shader-f16"],
	optionalFeatures: ["timestamp-query"]
});
assert.equal(report.compatible, false);
assert.deepEqual(report.missingRequiredFeatures, ["shader-f16"]);
assert.deepEqual(report.availableOptionalFeatures, ["timestamp-query"]);
assert.equal(report.implemented.picFlipDeposition, false);

const shaderA = createWebGpuShaderManifest3d({
	name: "liquid",
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: ["integrate_particles", "clear_grid"]
});
const shaderB = createWebGpuShaderManifest3d({
	name: "liquid",
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: ["clear_grid", "integrate_particles"]
});
assert.equal(shaderA.contentHash, shaderB.contentHash);
assert.throws(() => createWebGpuShaderManifest3d({
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: ["missing_entry"]
}), /absent/);

const pass = createWebGpuComputePass3d({
	id: "particles",
	shaderName: "liquid",
	entryPoint: "integrate_particles",
	elementCount: 130,
	workgroupSize: 64
});
assert.deepEqual(pass.dispatch, [3, 1, 1]);
const plan = createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	maximumWorkgroups: 10
});
assert.equal(plan.totalWorkgroups, 10);
assert.equal(plan.submissionCount, 1);
assert.throws(() => createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	maximumWorkgroups: 9
}), /exceed budget/);

console.log('B"H | proceduralObjectWebGpuContracts3d.test passed');
