// B"H
// Boruch Hashem
// Blessed is He
/** WebGPU contracts prove pressure, curl, FLIP history, shader entries, and bounded dispatch. */

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
const report = createWebGpuCapabilityReport3d({ available: true });
assert.equal(report.implemented.collocatedPressureProjection, true);
assert.equal(report.implemented.flipGridToParticleTransfer, true);
assert.equal(report.implemented.gridVelocityHistory, true);
assert.equal(report.implemented.vorticityConfinement, true);
assert.equal(report.implemented.apicTransfer, false);
assert.equal(report.implemented.macPressureProjection, false);

const entries = [
	"compute_vorticity",
	"apply_vorticity_confinement",
	"transfer_grid_to_particles_flip",
	"store_grid_history"
];
const shader = createWebGpuShaderManifest3d({
	name: "liquid-flip-vorticity",
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: entries
});
assert.deepEqual(shader.entryPoints, entries);
const plan = createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	pressureIterations: 8,
	maximumWorkgroups: 38
});
assert.equal(plan.enabledPasses.length, 18);
assert.equal(plan.totalWorkgroups, 38);
assert.deepEqual(plan.enabledPasses.slice(-4).map(value => value.entryPoint), [
	"compute_vorticity",
	"apply_vorticity_confinement",
	"transfer_grid_to_particles_flip",
	"store_grid_history"
]);
assert.throws(() => createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	pressureIterations: 8,
	maximumWorkgroups: 37
}), /exceed budget/);
assert.throws(() => createWebGpuLiquidFramePlan3d({
	particleCount: 1,
	gridCellCount: 8,
	pressureIterations: 3
}), /positive even integer/);

console.log('B"H | proceduralObjectWebGpuContracts3d.test passed');
