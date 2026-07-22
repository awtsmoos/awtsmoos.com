// B"H
// Boruch Hashem
// Blessed is He
/** One aligned uniform page carries bounded frame and domain parameters to WGSL. */

import { WEB_GPU_UNIFORM_BUFFER_BYTES } from "./webGpuConstants.js";

export function packWebGpuLiquidUniforms3d(input) {
	const bytes = new ArrayBuffer(WEB_GPU_UNIFORM_BUFFER_BYTES);
	const view = new DataView(bytes);
	view.setFloat32(0, Number(input.deltaTime ?? 0), true);
	view.setUint32(4, Math.max(0, Math.floor(input.particleCount ?? 0)), true);
	view.setUint32(8, Math.max(0, Math.floor(input.gridCellCount ?? 0)), true);
	view.setUint32(12, Math.max(0, Math.floor(input.frameIndex ?? 0)), true);
	const vectors = [
		[input.gravity ?? [0, -9.81, 0], 16],
		[input.boundsMin ?? [-1, -1, -1], 32],
		[input.boundsMax ?? [1, 1, 1], 48]
	];
	for (const [vector, offset] of vectors) {
		for (let axis = 0; axis < 3; axis += 1) {
			view.setFloat32(offset + axis * 4, Number(vector[axis]), true);
		}
	}
	view.setFloat32(64, Number(input.damping ?? 0.999), true);
	view.setFloat32(68, Number(input.restitution ?? 0), true);
	view.setFloat32(72, Number(input.fixedPointScale ?? 1024), true);
	return Object.freeze({
		schema: "awtsmoos.webgpu-liquid-uniform-bytes-3d",
		byteLength: bytes.byteLength,
		bytes: new Uint8Array(bytes),
		buffer: bytes
	});
}
