// B"H
// Boruch Hashem
// Blessed is He
/** Particle identity and physics become a stable 48-byte GPU structure. */

import { WEB_GPU_PARTICLE_STRIDE_BYTES } from "./webGpuConstants.js";

export function packWebGpuParticles3d(particleSystem) {
	if (!particleSystem || !Array.isArray(particleSystem.particles)) {
		throw new TypeError("WebGPU particle packing requires a particle system.");
	}
	const floatsPerParticle = WEB_GPU_PARTICLE_STRIDE_BYTES / Float32Array.BYTES_PER_ELEMENT;
	const values = new Float32Array(particleSystem.particles.length * floatsPerParticle);
	particleSystem.particles.forEach((particle, index) => {
		const offset = index * floatsPerParticle;
		values.set([
			particle.position[0], particle.position[1], particle.position[2], particle.size,
			particle.velocity[0], particle.velocity[1], particle.velocity[2], particle.mass,
			particle.age, particle.lifetime, index, 0
		], offset);
	});
	return Object.freeze({
		schema: "awtsmoos.webgpu-particle-bytes-3d",
		particleCount: particleSystem.particles.length,
		strideBytes: WEB_GPU_PARTICLE_STRIDE_BYTES,
		byteLength: values.byteLength,
		values
	});
}
