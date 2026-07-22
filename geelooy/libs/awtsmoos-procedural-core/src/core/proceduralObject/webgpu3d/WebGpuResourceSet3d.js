// B"H
// Boruch Hashem
// Blessed is He
/** Particle, atomic-grid, velocity-grid, uniform, and surface vessels remain GPU-resident. */

import { createWebGpuBufferDescriptor3d } from "./createWebGpuBufferDescriptor3d.js";
import {
	WEB_GPU_PARTICLE_STRIDE_BYTES,
	WEB_GPU_UNIFORM_BUFFER_BYTES
} from "./webGpuConstants.js";

function positiveInteger(value, fallback, label) {
	const integer = Math.max(1, Math.floor(Number(value ?? fallback)));
	if (!Number.isFinite(integer)) throw new TypeError(`${label} must be finite.`);
	return integer;
}

function createBuffer(device, constants, input) {
	const descriptor = createWebGpuBufferDescriptor3d(input);
	return Object.freeze({
		descriptor,
		buffer: device.createBuffer(descriptor.toHostDescriptor(constants))
	});
}

export class WebGpuResourceSet3d {
	#parity = 0;

	constructor(input) {
		if (!input?.device || typeof input.device.createBuffer !== "function") {
			throw new TypeError("WebGPU resources require a GPUDevice-like object.");
		}
		const particleCapacity = positiveInteger(input.particleCapacity, 1, "Particle capacity");
		const gridCellCount = positiveInteger(input.gridCellCount, 1, "Grid cell count");
		const maximumBytes = Number(input.maximumBytes ?? 256 * 1024 * 1024);
		if (!Number.isFinite(maximumBytes) || maximumBytes <= 0) {
			throw new TypeError("WebGPU total byte budget must be positive and finite.");
		}
		const particleBytes = particleCapacity * WEB_GPU_PARTICLE_STRIDE_BYTES;
		const gridBytes = gridCellCount * 16;
		const surfaceBytes = particleCapacity * 16;
		const totalBytes = particleBytes * 2 + gridBytes * 2
			+ surfaceBytes + WEB_GPU_UNIFORM_BUFFER_BYTES;
		if (totalBytes > maximumBytes) {
			throw new RangeError(`WebGPU resources exceed total byte budget: ${totalBytes}`);
		}
		const common = { maximumBytes };
		this.particles = Object.freeze([
			createBuffer(input.device, input.usageConstants, {
				...common,
				label: "awtsmoos-particles-a",
				size: particleBytes,
				usageNames: ["STORAGE", "COPY_DST", "COPY_SRC"]
			}),
			createBuffer(input.device, input.usageConstants, {
				...common,
				label: "awtsmoos-particles-b",
				size: particleBytes,
				usageNames: ["STORAGE", "COPY_DST", "COPY_SRC"]
			})
		]);
		this.uniforms = createBuffer(input.device, input.usageConstants, {
			...common,
			label: "awtsmoos-liquid-uniforms",
			size: WEB_GPU_UNIFORM_BUFFER_BYTES,
			usageNames: ["UNIFORM", "COPY_DST"]
		});
		this.grid = createBuffer(input.device, input.usageConstants, {
			...common,
			label: "awtsmoos-liquid-atomic-grid",
			size: gridBytes,
			usageNames: ["STORAGE", "COPY_DST", "COPY_SRC"]
		});
		this.gridVelocities = createBuffer(input.device, input.usageConstants, {
			...common,
			label: "awtsmoos-liquid-grid-velocities",
			size: gridBytes,
			usageNames: ["STORAGE", "COPY_DST", "COPY_SRC"]
		});
		this.surfacePoints = createBuffer(input.device, input.usageConstants, {
			...common,
			label: "awtsmoos-surface-points",
			size: surfaceBytes,
			usageNames: ["STORAGE", "VERTEX", "COPY_SRC"]
		});
		this.particleCapacity = particleCapacity;
		this.gridCellCount = gridCellCount;
		this.totalBytes = totalBytes;
		Object.freeze(this);
	}

	get parity() { return this.#parity; }
	get currentParticleBuffer() { return this.particles[this.#parity].buffer; }
	get nextParticleBuffer() { return this.particles[1 - this.#parity].buffer; }
	get uniformBuffer() { return this.uniforms.buffer; }
	get gridBuffer() { return this.grid.buffer; }
	get gridVelocityBuffer() { return this.gridVelocities.buffer; }
	get surfacePointBuffer() { return this.surfacePoints.buffer; }
	swap() { this.#parity = 1 - this.#parity; return this.#parity; }
}
