// B"H
// Boruch Hashem
// Blessed is He
/** Persistent GPU state gathers particles, buffers, shader, pipelines, and truth. */

import { createWebGpuCapabilityReport3d } from "./createWebGpuCapabilityReport3d.js";
import { createWebGpuShaderManifest3d } from "./createWebGpuShaderManifest3d.js";
import { packWebGpuParticles3d } from "./packWebGpuParticles3d.js";
import { WebGpuPipelineCache3d } from "./WebGpuPipelineCache3d.js";
import { WebGpuResourceSet3d } from "./WebGpuResourceSet3d.js";
import { WEB_GPU_LIQUID_ENTRY_POINTS, WEB_GPU_LIQUID_WGSL } from "./webGpuLiquidWgsl.js";

function finiteVector3(value, fallback, label) {
	const source = value ?? fallback;
	if (!Array.isArray(source) || source.length !== 3) {
		throw new TypeError(`${label} must contain three values.`);
	}
	const vector = source.map(Number);
	if (vector.some(component => !Number.isFinite(component))) {
		throw new TypeError(`${label} components must be finite.`);
	}
	return Object.freeze(vector);
}

function assertDevice(device) {
	const methods = ["createBuffer", "createShaderModule", "createComputePipeline", "createBindGroup", "createCommandEncoder"];
	if (!device?.queue || methods.some(name => typeof device[name] !== "function")) {
		throw new TypeError("WebGPU liquid runtime requires a complete GPUDevice-like object.");
	}
	if (typeof device.queue.writeBuffer !== "function" || typeof device.queue.submit !== "function") {
		throw new TypeError("WebGPU liquid runtime requires GPU queue write and submit methods.");
	}
	return device;
}

export function createWebGpuLiquidRuntimeState3d(input) {
	const device = assertDevice(input?.device);
	const packedParticles = packWebGpuParticles3d(input.particleSystem);
	const particleCapacity = Math.max(1, Math.floor(input.particleCapacity ?? packedParticles.particleCount));
	if (particleCapacity < packedParticles.particleCount) {
		throw new RangeError("WebGPU particle capacity cannot be smaller than particle count.");
	}
	const gridCellCount = Math.max(0, Math.floor(input.gridCellCount ?? 0));
	const resources = new WebGpuResourceSet3d({
		device,
		usageConstants: input.usageConstants,
		particleCapacity,
		gridCellCount: Math.max(1, gridCellCount),
		maximumBytes: input.maximumBytes
	});
	device.queue.writeBuffer(resources.currentParticleBuffer, 0, packedParticles.values);
	device.queue.writeBuffer(resources.nextParticleBuffer, 0, packedParticles.values);
	const shaderManifest = createWebGpuShaderManifest3d({
		name: "awtsmoos-liquid-core",
		code: WEB_GPU_LIQUID_WGSL,
		entryPoints: WEB_GPU_LIQUID_ENTRY_POINTS
	});
	const shaderModule = device.createShaderModule({ label: shaderManifest.name, code: shaderManifest.code });
	return Object.freeze({
		device,
		particleCount: packedParticles.particleCount,
		particleCapacity,
		gridCellCount,
		boundsMin: finiteVector3(input.boundsMin, [-1, -1, -1], "WebGPU bounds minimum"),
		boundsMax: finiteVector3(input.boundsMax, [1, 1, 1], "WebGPU bounds maximum"),
		maximumWorkgroups: input.maximumWorkgroups ?? Number.MAX_SAFE_INTEGER,
		resources,
		shaderManifest,
		shaderModule,
		pipelines: new WebGpuPipelineCache3d({ device, shaderModule }),
		bindGroups: new Map(),
		capabilities: createWebGpuCapabilityReport3d({
			device,
			requiredFeatures: input.requiredFeatures,
			optionalFeatures: input.optionalFeatures
		})
	});
}
