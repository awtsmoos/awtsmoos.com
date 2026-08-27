// B"H
// Boruch Hashem
// Blessed is He
/** One page carries frame, pressure, PIC, FLIP, and rotational strength into WGSL. */

import { createWebGpuGridLayout3d } from "./createWebGpuGridLayout3d.js";
import { WEB_GPU_UNIFORM_BUFFER_BYTES } from "./webGpuConstants.js";

function writeVector3(view, offset, value) {
	for (let axis = 0; axis < 3; axis += 1) {
		view.setFloat32(offset + axis * 4, Number(value[axis]), true);
	}
}

function positive(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`${label} must be positive and finite.`);
	}
	return number;
}

function nonnegative(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`${label} must be finite and nonnegative.`);
	}
	return number;
}

export function packWebGpuLiquidUniforms3d(input) {
	const layout = createWebGpuGridLayout3d(input.gridLayout ?? input);
	const picBlend = Math.max(0, Math.min(1, Number(input.picBlend ?? 1)));
	const flipBlend = Math.max(0, Math.min(1, Number(input.flipBlend ?? 0.95)));
	const fluidDensity = positive(input.fluidDensity, 1000, "Fluid density");
	const pressureRelaxation = Math.max(0, Math.min(1, Number(input.pressureRelaxation ?? 1)));
	const vorticityStrength = nonnegative(input.vorticityStrength, 0, "Vorticity strength");
	if (![picBlend, flipBlend, pressureRelaxation].every(Number.isFinite)) {
		throw new TypeError("PIC, FLIP, and pressure blends must be finite.");
	}
	const bytes = new ArrayBuffer(WEB_GPU_UNIFORM_BUFFER_BYTES);
	const view = new DataView(bytes);
	view.setFloat32(0, Number(input.deltaTime ?? 0), true);
	view.setUint32(4, Math.max(0, Math.floor(input.particleCount ?? 0)), true);
	view.setUint32(8, layout.cellCount, true);
	view.setUint32(12, Math.max(0, Math.floor(input.frameIndex ?? 0)), true);
	writeVector3(view, 16, input.gravity ?? [0, -9.81, 0]);
	writeVector3(view, 32, input.boundsMin ?? [-1, -1, -1]);
	writeVector3(view, 48, input.boundsMax ?? [1, 1, 1]);
	view.setFloat32(64, Number(input.damping ?? 0.999), true);
	view.setFloat32(68, Number(input.restitution ?? 0), true);
	view.setFloat32(72, Number(input.fixedPointScale ?? 1024), true);
	writeVector3(view, 80, layout.origin);
	view.setFloat32(96, layout.cellSize, true);
	view.setUint32(100, layout.dimensions[0], true);
	view.setUint32(104, layout.dimensions[1], true);
	view.setUint32(108, layout.dimensions[2], true);
	view.setFloat32(112, picBlend, true);
	view.setFloat32(116, fluidDensity, true);
	view.setFloat32(120, pressureRelaxation, true);
	view.setFloat32(124, flipBlend, true);
	view.setFloat32(128, vorticityStrength, true);
	return Object.freeze({
		schema: "awtsmoos.webgpu-liquid-uniform-bytes-3d",
		byteLength: bytes.byteLength,
		layout,
		picBlend,
		flipBlend,
		fluidDensity,
		pressureRelaxation,
		vorticityStrength,
		bytes: new Uint8Array(bytes),
		buffer: bytes
	});
}
