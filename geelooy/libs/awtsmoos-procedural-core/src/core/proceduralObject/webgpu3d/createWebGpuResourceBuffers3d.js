// B"H
// Boruch Hashem
// Blessed is He
/** Eleven resident GPU vessels preserve pressure, curl, and projected velocity history. */

import { createWebGpuBufferDescriptor3d } from "./createWebGpuBufferDescriptor3d.js";
import {
	WEB_GPU_PARTICLE_STRIDE_BYTES,
	WEB_GPU_UNIFORM_BUFFER_BYTES,
	alignWebGpuBytes
} from "./webGpuConstants.js";

function createBuffer(device, constants, maximumBytes, label, size, usageNames) {
	const descriptor = createWebGpuBufferDescriptor3d({
		label,
		size,
		maximumBytes,
		usageNames
	});
	return Object.freeze({
		descriptor,
		buffer: device.createBuffer(descriptor.toHostDescriptor(constants))
	});
}

export function createWebGpuResourceBuffers3d(input) {
	const particleBytes = input.particleCapacity * WEB_GPU_PARTICLE_STRIDE_BYTES;
	const gridBytes = input.gridCellCount * 16;
	const scalarBytes = alignWebGpuBytes(input.gridCellCount * 4, 16);
	const surfaceBytes = input.particleCapacity * 16;
	const totalBytes = particleBytes * 2 + gridBytes * 4 + scalarBytes * 3
		+ surfaceBytes + WEB_GPU_UNIFORM_BUFFER_BYTES;
	if (totalBytes > input.maximumBytes) {
		throw new RangeError(`WebGPU resources exceed total byte budget: ${totalBytes}`);
	}
	const buffer = (label, size, usageNames) => createBuffer(
		input.device,
		input.usageConstants,
		input.maximumBytes,
		label,
		size,
		usageNames
	);
	const gridUsage = ["STORAGE", "COPY_DST", "COPY_SRC"];
	return Object.freeze({
		particles: Object.freeze([
			buffer("awtsmoos-particles-a", particleBytes, gridUsage),
			buffer("awtsmoos-particles-b", particleBytes, gridUsage)
		]),
		uniforms: buffer("awtsmoos-liquid-uniforms", WEB_GPU_UNIFORM_BUFFER_BYTES, ["UNIFORM", "COPY_DST"]),
		grid: buffer("awtsmoos-liquid-atomic-grid", gridBytes, gridUsage),
		gridVelocities: buffer("awtsmoos-liquid-grid-velocities", gridBytes, gridUsage),
		previousGridVelocities: buffer("awtsmoos-liquid-grid-history", gridBytes, gridUsage),
		vorticity: buffer("awtsmoos-liquid-vorticity", gridBytes, gridUsage),
		divergence: buffer("awtsmoos-liquid-divergence", scalarBytes, gridUsage),
		pressureA: buffer("awtsmoos-liquid-pressure-a", scalarBytes, gridUsage),
		pressureB: buffer("awtsmoos-liquid-pressure-b", scalarBytes, gridUsage),
		surfacePoints: buffer("awtsmoos-surface-points", surfaceBytes, ["STORAGE", "VERTEX", "COPY_SRC"]),
		totalBytes
	});
}
