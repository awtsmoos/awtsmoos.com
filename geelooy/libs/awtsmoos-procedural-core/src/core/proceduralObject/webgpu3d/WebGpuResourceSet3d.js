// B"H
// Boruch Hashem
// Blessed is He
/** Double-buffered GPU resources remain resident and swap without per-frame allocation. */

import { createWebGpuBufferDescriptor3d } from "./createWebGpuBufferDescriptor3d.js";
import {
	WEB_GPU_PARTICLE_STRIDE_BYTES,
	WEB_GPU_UNIFORM_BUFFER_BYTES
} from "./webGpuConstants.js";

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
		const maximumBytes = input.maximumBytes ?? 256 * 1024 * 1024;
		const particleBytes = Math.max(4, input.particleCapacity * WEB_GPU_PARTICLE_STRIDE_BYTES);
		const gridBytes = Math.max(16, input.gridCellCount * 16);
		const surfaceBytes = Math.max(16, input.particleCapacity * 16);
		const common = { maximumBytes };
		this.particles = Object.freeze([
			createBuffer(input.device, input.usageConstants, {
				...common, label: "awtsmoos-particles-a", size: particleBytes,
				usageNames: ["STORAGE", "COPY_DST", "COPY_SRC"]
			}),
			createBuffer(input.device, input.usageConstants, {
				...common, label: "awtsmoos-particles-b", size: particleBytes,
				usageNames: ["STORAGE", "COPY_DST", "COPY_SRC"]
			})
		]);
		this.uniforms = createBuffer(input.device, input.usageConstants, {
			...common, label: "awtsmoos-liquid-uniforms",
			size: WEB_GPU_UNIFORM_BUFFER_BYTES, usageNames: ["UNIFORM", "COPY_DST"]
		});
		this.grid = createBuffer(input.device, input.usageConstants, {
			...common, label: "awtsmoos-liquid-grid", size: gridBytes,
			usageNames: ["STORAGE", "COPY_DST", "COPY_SRC"]
		});
		this.surfacePoints = createBuffer(input.device, input.usageConstants, {
			...common, label: "awtsmoos-surface-points", size: surfaceBytes,
			usageNames: ["STORAGE", "VERTEX", "COPY_SRC"]
		});
		this.totalBytes = particleBytes * 2 + gridBytes + surfaceBytes
			+ WEB_GPU_UNIFORM_BUFFER_BYTES;
		if (this.totalBytes > maximumBytes) {
			throw new RangeError(`WebGPU resources exceed total byte budget: ${this.totalBytes}`);
		}
		Object.freeze(this);
	}

	get parity() { return this.#parity; }
	get currentParticleBuffer() { return this.particles[this.#parity].buffer; }
	get nextParticleBuffer() { return this.particles[1 - this.#parity].buffer; }
	get uniformBuffer() { return this.uniforms.buffer; }
	get gridBuffer() { return this.grid.buffer; }
	get surfacePointBuffer() { return this.surfacePoints.buffer; }

	swap() {
		this.#parity = 1 - this.#parity;
		return this.#parity;
	}
}
