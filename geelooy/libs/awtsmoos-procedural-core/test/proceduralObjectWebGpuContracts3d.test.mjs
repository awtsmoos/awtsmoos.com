// B"H
// Boruch Hashem
// Blessed is He
/** WebGPU contracts prove pressure capabilities, shader entries, and bounded iteration dispatch. */

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
assert.equal(report.implemented.collocatedDivergence, true);
assert.equal(report.implemented.collocatedPressureProjection, true);
assert.equal(report.implemented.occupiedAirPressureBoundary, true);
assert.equal(report.implemented.macPressureProjection, false);

const pressureEntries = [
	"compute_divergence",
	"jacobi_pressure_a",
	"jacobi_pressure_b",
	"project_grid_velocity"
];
const shader = createWebGpuShaderManifest3d({
	name: "liquid-pressure",
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: pressureEntries
});
assert.deepEqual(shader.entryPoints, pressureEntries);
assert.throws(() => createWebGpuShaderManifest3d({
	code: WEB_GPU_LIQUID_WGSL,
	entryPoints: ["missing_pressure_entry"]
}), /absent/);

const plan = createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	pressureIterations: 8,
	maximumWorkgroups: 32
});
assert.equal(plan.pressureIterations, 8);
assert.equal(plan.enabledPasses.length, 15);
assert.equal(plan.totalWorkgroups, 32);
assert.equal(plan.submissionCount, 1);
assert.deepEqual(plan.enabledPasses.slice(4, 7).map(value => value.entryPoint), [
	"compute_divergence",
	"jacobi_pressure_a",
	"jacobi_pressure_b"
]);
assert.equal(plan.enabledPasses.at(-2).entryPoint, "project_grid_velocity");
assert.equal(plan.enabledPasses.at(-1).entryPoint, "transfer_grid_to_particles");
assert.throws(() => createWebGpuLiquidFramePlan3d({
	particleCount: 130,
	gridCellCount: 65,
	pressureIterations: 8,
	maximumWorkgroups: 31
}), /exceed budget/);
assert.throws(() => createWebGpuLiquidFramePlan3d({
	particleCount: 1,
	gridCellCount: 8,
	pressureIterations: 3
}), /positive even integer/);

console.log('B"H | proceduralObjectWebGpuContracts3d.test passed');
