// B"H
// Boruch Hashem
// Blessed is He
/** GPU memory enters through aligned, budgeted, and named immutable declarations. */

import {
	alignWebGpuBytes,
	normalizeWebGpuUsageNames,
	resolveWebGpuUsageBits
} from "./webGpuConstants.js";

export function createWebGpuBufferDescriptor3d(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("WebGPU buffer descriptor must be an object.");
	}
	const size = alignWebGpuBytes(input.size, input.alignment ?? 4);
	if (size <= 0) {
		throw new RangeError("WebGPU buffer size must be positive.");
	}
	const maximumBytes = Number(input.maximumBytes ?? Number.MAX_SAFE_INTEGER);
	if (!Number.isFinite(maximumBytes) || maximumBytes <= 0) {
		throw new TypeError("WebGPU maximum buffer bytes must be positive and finite.");
	}
	if (size > maximumBytes) {
		throw new RangeError(`WebGPU buffer exceeds byte budget: ${size} > ${maximumBytes}`);
	}
	const usageNames = normalizeWebGpuUsageNames(input.usageNames);
	return Object.freeze({
		schema: "awtsmoos.webgpu-buffer-descriptor-3d",
		label: typeof input.label === "string" ? input.label : "awtsmoos-buffer",
		size,
		usageNames,
		mappedAtCreation: input.mappedAtCreation === true,
		toHostDescriptor(constants) {
			return Object.freeze({
				label: this.label,
				size: this.size,
				usage: resolveWebGpuUsageBits(this.usageNames, constants),
				mappedAtCreation: this.mappedAtCreation
			});
		}
	});
}
