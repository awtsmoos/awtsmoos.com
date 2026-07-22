// B"H
// Boruch Hashem
// Blessed is He
/** Particles, projected history, curl, pressure, uniforms, and surfaces persist across frames. */

import { createWebGpuResourceBuffers3d } from "./createWebGpuResourceBuffers3d.js";

function positiveInteger(value, fallback, label) {
	const integer = Math.max(1, Math.floor(Number(value ?? fallback)));
	if (!Number.isFinite(integer)) throw new TypeError(`${label} must be finite.`);
	return integer;
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
		const buffers = createWebGpuResourceBuffers3d({
			device: input.device,
			usageConstants: input.usageConstants,
			particleCapacity,
			gridCellCount,
			maximumBytes
		});
		Object.assign(this, buffers);
		this.particleCapacity = particleCapacity;
		this.gridCellCount = gridCellCount;
		Object.freeze(this);
	}

	get parity() { return this.#parity; }
	get currentParticleBuffer() { return this.particles[this.#parity].buffer; }
	get nextParticleBuffer() { return this.particles[1 - this.#parity].buffer; }
	get uniformBuffer() { return this.uniforms.buffer; }
	get gridBuffer() { return this.grid.buffer; }
	get gridVelocityBuffer() { return this.gridVelocities.buffer; }
	get previousGridVelocityBuffer() { return this.previousGridVelocities.buffer; }
	get vorticityBuffer() { return this.vorticity.buffer; }
	get divergenceBuffer() { return this.divergence.buffer; }
	get pressureABuffer() { return this.pressureA.buffer; }
	get pressureBBuffer() { return this.pressureB.buffer; }
	get surfacePointBuffer() { return this.surfacePoints.buffer; }
	swap() { this.#parity = 1 - this.#parity; return this.#parity; }
}
