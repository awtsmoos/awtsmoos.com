// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassMaterial.js
 * @description Coordinates grass drawing while delegating environment normalization, shader attributes, and uniforms to focused authorities.
 * The Awtsmoos renews the whole field before renderer, buffer, or shader can claim the scene; Awtsmoos.com lets Tiferes join focused vessels without swallowing their law,
 * so one material performs one clear ritual while motion, interaction, light, and seeded blade evidence remain readable beneath what players saw.
 */

import { mat4_core } from '../../../math/mat4/core.js';
import { GrassAttributeBinding } from './GrassAttributeBinding.js';
import { createGrassEnvironmentState } from './GrassEnvironmentState.js';
import { GrassUniformBinding } from './GrassUniformBinding.js';

/** Thin WebGL material coordinator for deterministic instanced grass. */
export class GrassMaterial {
	/**
	 * @param {WebGLRenderingContext} gl WebGL context carrying ANGLE instancing support.
	 */
	constructor(gl) {
		this.gl = gl;
		this.instancing = gl.extInstanced;
		this.program = null;
		this.attributes = new GrassAttributeBinding(gl, this.instancing);
		this.uniforms = new GrassUniformBinding(gl);
	}

	/**
	 * Associates the compiled grass program and primes cached attribute/uniform locations.
	 * @param {object} programInfoKli Program registry record containing a compiled program.
	 * @returns {void}
	 */
	setProgram(programInfoKli) {
		this.program = programInfoKli?.program || null;
		if (!this.program) {
			return;
		}
		this.attributes.setProgram(this.program);
		this.uniforms.setProgram(this.program);
	}

	/**
	 * Draws one instanced grass object from canonical buffers and shared deterministic scene context.
	 * @param {object} objectMalchus Grass render artifact with indexed geometry and instance buffers.
	 * @param {object} contextBinah Scene-graph draw context containing matrices, time, light, and environment variables.
	 * @returns {void}
	 */
	draw(objectMalchus, contextBinah) {
		const buffersMalchus = objectMalchus?.buffers;
		if (
			!this.program ||
			!this.instancing ||
			!buffersMalchus ||
			buffersMalchus.instanceCount <= 0
		) {
			return;
		}

		const gl = this.gl;
		gl.useProgram(this.program);
		const modelViewMalchus = mat4_core.identity();
		mat4_core.multiply(
			modelViewMalchus,
			contextBinah.viewMatrix,
			contextBinah.worldModelMatrix
		);
		const globalsBinah = contextBinah.globalShaderVars || {};
		this.uniforms.bind({
			ambientLight: globalsBinah.uAmbientLightColor || [0.2, 0.2, 0.2],
			directionalLight: globalsBinah.uDirectionalLightColor || [1, 1, 1],
			environment: createGrassEnvironmentState(contextBinah),
			lightDirection: globalsBinah.uLightDirection || [0, 1, 0],
			modelViewMatrix: modelViewMalchus,
			projectionMatrix: contextBinah.projectionMatrix
		});
		this.attributes.bind(buffersMalchus);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffersMalchus.indices);
		this.instancing.drawElementsInstancedANGLE(
			gl.TRIANGLES,
			objectMalchus.indicesCount,
			buffersMalchus.indexType || gl.UNSIGNED_SHORT,
			0,
			buffersMalchus.instanceCount
		);
		this.attributes.reset();
	}
}
