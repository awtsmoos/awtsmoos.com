// B"H
// Boruch Hashem
// Blessed is He
/** Pipeline layouts receive one sparse bind group assembled from explicit entry-point truth. */

import { webGpuBindGroupEntries3d } from "./webGpuBindGroupEntries3d.js";

export function createWebGpuBindGroup3d(device, pipeline, entryPoint, resources) {
	if (!device || typeof device.createBindGroup !== "function") {
		throw new TypeError("WebGPU bind-group creation requires a GPUDevice-like object.");
	}
	if (!pipeline || typeof pipeline.getBindGroupLayout !== "function") {
		throw new TypeError("WebGPU bind-group creation requires a compute pipeline.");
	}
	return device.createBindGroup({
		label: `awtsmoos-${entryPoint}-parity-${resources.parity}`,
		layout: pipeline.getBindGroupLayout(0),
		entries: webGpuBindGroupEntries3d(entryPoint, resources)
	});
}
