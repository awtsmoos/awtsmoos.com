// B"H
// Boruch Hashem
// Blessed is He
/** WebGPU contracts prove alignment, feature truth, shader entries, and fused PIC dispatch. */

import assert from "node:assert/strict";
import {
	createWebGpuBufferDescriptor3d,
	createWebGpuCapabilityReport3d,
	createWebGpuLiquidFramePlan3d,
	createWebGpuShaderManifest3d,
	WEB_GPU_LIQUID_WGSL
} from "../src/core/proceduralObject/webgpu3d/index.js";
import { MOCK_GPU_BUFFER_USAGE } from "./helpers/createRecordingWebGpuDevice.mjs";

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
assert.equal(report.implemented.gridVelocityNormalization, true);
assert.equal(report.implemented.picGridToParticleTransfer, true);
assert.equal(report.implemented.picFlipDeposition, false);

const shader = createWebGpuShaderManifest3d({
	name: "liquid-pic",
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: [
		"clear_grid",
		"deposit_particles",
		"apply_grid_forces",
		"normalize_grid",
		"transfer_grid_to_particles"
	]
});
assert.equal(shader.entryPoints.length, 5);
assert.throws(() => createWebGpuShaderManifest3d({
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: ["missing_entry"]
}), /absent/);

const plan = createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	maximumWorkgroups: 12
});
assert.deepEqual(plan.enabledPasses.map(value => value.id), [
	"clear-grid",
	"deposit-particles",
	"apply-grid-forces",
	"normalize-grid",
	"transfer-grid-to-particles"
]);
assert.equal(plan.totalWorkgroups, 12);
assert.equal(plan.submissionCount, 1);
assert.throws(() => createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	maximumWorkgroups: 11
}), /exceed budget/);

console.log('B"H | proceduralObjectWebGpuContracts3d.test passed');
