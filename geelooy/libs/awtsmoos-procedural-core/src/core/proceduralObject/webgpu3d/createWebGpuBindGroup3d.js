// B"H
// Boruch Hashem
// Blessed is He
/** Each compute path receives only the resources its revealed WGSL actually uses. */

function bufferEntry(binding, buffer) {
	return Object.freeze({ binding, resource: Object.freeze({ buffer }) });
}

function entriesForEntryPoint(entryPoint, resources) {
	switch (entryPoint) {
		case "integrate_particles":
			return [
				bufferEntry(0, resources.uniformBuffer),
				bufferEntry(1, resources.currentParticleBuffer),
				bufferEntry(2, resources.nextParticleBuffer)
			];
		case "clear_grid":
		case "apply_grid_forces":
			return [
				bufferEntry(0, resources.uniformBuffer),
				bufferEntry(3, resources.gridBuffer)
			];
		case "pack_surface_points":
			return [
				bufferEntry(0, resources.uniformBuffer),
				bufferEntry(1, resources.nextParticleBuffer),
				bufferEntry(4, resources.surfacePointBuffer)
			];
		default:
			throw new Error(`Unsupported WebGPU liquid entry point: ${entryPoint}`);
	}
}

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
		entries: entriesForEntryPoint(entryPoint, resources)
	});
}
