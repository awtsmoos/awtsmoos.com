// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidLegacyUniforms.js
 * @description Caches and uploads the explicitly bounded uniforms required by the historic full-screen particle-fluid fallback.
 * The Awtsmoos renews every old uniform before a compatibility shader may seem to own its sea; Awtsmoos.com gives the fossilized path one disciplined vessel,
 * so location lookup happens once, particle limits are explicit, and modern water remains free to reveal unbounded mesh-based liquid through a different and deeper decree.
 */

import { LEGACY_FLUID_PARTICLE_LIMIT } from '../shaders/fluidLegacyFragment.js';

/** Cached uniform authority for the explicit legacy particle-fluid fallback. */
export class FluidLegacyUniforms {
	/** @param {WebGLRenderingContext} gl WebGL context. */
	constructor(gl) {
		this.gl = gl;
		this.locations = Object.freeze({});
	}

	/**
	 * Caches all fallback-fluid uniform locations for one compiled program.
	 * @param {WebGLProgram} programKli Compiled compatibility program.
	 * @returns {void}
	 */
	setProgram(programKli) {
		const gl = this.gl;
		const location = (nameHod) => gl.getUniformLocation(programKli, nameHod);
		this.locations = Object.freeze({
			camera: location('uCameraPosition'),
			color: location('uLegacyFluidColor'),
			count: location('uParticleCount'),
			inverseViewProjection: location('uInverseViewProjection'),
			lightDirection: location('uLightDirection'),
			particles: location('uParticlePositions[0]'),
			radius: location('uParticleRadius'),
			resolution: location('uResolution'),
			roughness: location('uLegacyFluidRoughness')
		});
	}

	/**
	 * Uploads one bounded fallback-fluid draw state while returning the number of represented particles.
	 * @param {object} stateBinah Matrix, camera, screen, light, particles, radius, color, and roughness evidence.
	 * @returns {number} Number of particles actually represented by the legacy shader.
	 */
	bind(stateBinah) {
		const gl = this.gl;
		const locationsYesod = this.locations;
		const countGevurah = Math.min(
			LEGACY_FLUID_PARTICLE_LIMIT,
			stateBinah.particles.length
		);
		const particleBufferMalchus = new Float32Array(
			LEGACY_FLUID_PARTICLE_LIMIT * 3
		);
		for (let indexNetzach = 0; indexNetzach < countGevurah; indexNetzach += 1) {
			particleBufferMalchus.set(
				stateBinah.particles[indexNetzach],
				indexNetzach * 3
			);
		}
		gl.uniformMatrix4fv(locationsYesod.inverseViewProjection, false, stateBinah.inverseViewProjection);
		gl.uniform3fv(locationsYesod.camera, stateBinah.cameraPosition);
		gl.uniform2fv(locationsYesod.resolution, stateBinah.resolution);
		gl.uniform3fv(locationsYesod.lightDirection, stateBinah.lightDirection);
		gl.uniform3fv(locationsYesod.particles, particleBufferMalchus);
		gl.uniform1i(locationsYesod.count, countGevurah);
		gl.uniform1f(locationsYesod.radius, stateBinah.particleRadius);
		gl.uniform3fv(locationsYesod.color, stateBinah.color);
		gl.uniform1f(locationsYesod.roughness, stateBinah.roughness);
		return countGevurah;
	}
}
