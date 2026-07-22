// B"H
// Boruch Hashem
// Blessed is He
/** Persistent GPU resources, shaders, pipelines, and truth enter one bounded context. */

import { createWebGpuCapabilityReport3d } from "./createWebGpuCapabilityReport3d.js";
import { createWebGpuShaderManifest3d } from "./createWebGpuShaderManifest3d.js";
import { packWebGpuParticles3d } from "./packWebGpuParticles3d.js";
import { WebGpuLiquidPipelineCache3d } from "./WebGpuLiquidPipelineCache3d.js";
import { WebGpuResourceSet3d } from "./WebGpuResourceSet3d.js";
import {
	WEB_GPU_LIQUID_ENTRY_POINTS,
	WEB_GPU_LIQUID_WGSL
} from "./webGpuLiquidWgsl.js";

function vector3(value, fallback, label) {
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

export function createWebGpuLiquidRuntimeContext3d(input) {
	if (!input?.device?.queue || typeof input.device.createBuffer !== "function") {
		throw new TypeError("WebGPU liquid runtime requires a GPUDevice-like object.");
	}
	const packedParticles = packWebGpuParticles3d(input.particleSystem);
	const particleCount = packedParticles.particleCount;
	const gridCellCount = Math.max(0, Math.floor(input.gridCellCount ?? 0));
	const resources = new WebGpuResourceSet3d({
		device: input.device,
		usageConstants: input.usageConstants,
		particleCapacity: input.particleCapacity ?? Math.max(1, particleCount),
		gridCellCount,
		maximumBytes: input.maximumBytes
	});
	input.device.queue.writeBuffer(resources.currentParticleBuffer, 0, packedParticles.values);
	input.device.queue.writeBuffer(resources.nextParticleBuffer, 0, packedParticles.values);
	const shaderManifest = createWebGpuShaderManifest3d({
		name: "awtsmoos-liquid-core",
		code: WEB_GPU_LIQUID_WGSL,
		entryPoints: WEB_GPU_LIQUID_ENTRY_POINTS
	});
	const shaderModule = input.device.createShaderModule({
		label: shaderManifest.name,
		code: shaderManifest.code
	});
	return Object.freeze({
		device: input.device,
		resources,
		pipelineCache: new WebGpuLiquidPipelineCache3d(input.device, shaderModule),
		shaderManifest,
		capabilities: createWebGpuCapabilityReport3d({ device: input.device }),
		particleCount,
		gridCellCount,
		maximumWorkgroups: input.maximumWorkgroups ?? Number.MAX_SAFE_INTEGER,
		boundsMin: vector3(input.boundsMin, [-1, -1, -1], "WebGPU bounds minimum"),
		boundsMax: vector3(input.boundsMax, [1, 1, 1], "WebGPU bounds maximum"),
		defaultEnabledPasses: Object.freeze([...(input.enabledPasses ?? [
			"integrate-particles",
			"pack-surface-points"
		])])
	});
}
