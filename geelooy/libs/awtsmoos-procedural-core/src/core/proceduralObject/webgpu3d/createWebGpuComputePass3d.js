// B"H
// Boruch Hashem
// Blessed is He
/** Compute dispatch is finite work derived from declared elements and workgroup size. */

import { WEB_GPU_DEFAULT_WORKGROUP_SIZE } from "./webGpuConstants.js";

function positiveInteger(value, fallback, label) {
	const integer = Math.floor(Number(value ?? fallback));
	if (!Number.isFinite(integer) || integer <= 0) {
		throw new TypeError(`${label} must be a positive integer.`);
	}
	return integer;
}

export function createWebGpuComputePass3d(input) {
	const elementCount = Math.max(0, Math.floor(Number(input?.elementCount ?? 0)));
	if (!Number.isFinite(elementCount)) {
		throw new TypeError("WebGPU compute element count must be finite.");
	}
	const workgroupSize = positiveInteger(
		input.workgroupSize,
		WEB_GPU_DEFAULT_WORKGROUP_SIZE,
		"WebGPU workgroup size"
	);
	const dispatchX = elementCount === 0 ? 0 : Math.ceil(elementCount / workgroupSize);
	return Object.freeze({
		schema: "awtsmoos.webgpu-compute-pass-3d",
		id: String(input.id),
		shaderName: String(input.shaderName),
		entryPoint: String(input.entryPoint),
		elementCount,
		workgroupSize,
		dispatch: Object.freeze([dispatchX, 1, 1]),
		enabled: input.enabled !== false && dispatchX > 0,
		bindings: Object.freeze([...(input.bindings ?? [])].map(value => String(value)))
	});
}
