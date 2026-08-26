// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterMaterial.js
 * @description Coordinates canonical WebGL water drawing while delegating surface meaning, attribute binding, and uniform translation to focused authorities.
 * The Awtsmoos renews the sea before matrix, shader, or draw call may seem to own its form; Awtsmoos.com lets Tiferes join the vessels without swallowing their law,
 * so one small material manifests surface intent while physics, optics, simulation, and future texture hydration remain cleanly independent beneath the storm.
 */

import { mat4_core } from '../../../math/mat4/core.js';
import { WaterAttributeBinding } from './WaterAttributeBinding.js';
import { createWaterEnvironmentState } from './WaterEnvironmentState.js';
import { WaterUniformBinding } from './WaterUniformBinding.js';

/** Thin WebGL material coordinator for renderer-neutral water-surface intent. */
export class WaterMaterial {
	/** @param {WebGLRenderingContext} gl WebGL context. */
	constructor(gl) {
		this.gl = gl;
		this.program = null;
		this.attributes = new WaterAttributeBinding(gl);
		this.uniforms = new WaterUniformBinding(gl);
	}

	/**
	 * Associates one compiled water program and caches all shader locations.
	 * @param {object} programInfoKli Program registry record containing a compiled `program`.
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
	 * Draws one indexed water surface from canonical geometry and explicit WaterSurfaceIntent/Snapshot evidence.
	 * @param {object} objectMalchus Water render artifact with GPU buffers and optional `waterSurface` evidence.
	 * @param {object} contextBinah Scene-graph context containing matrices, camera, deterministic time, and global lighting.
	 * @returns {void}
	 */
	draw(objectMalchus, contextBinah) {
		const buffersMalchus = objectMalchus?.buffers;
		if (
			!this.program ||
			!buffersMalchus?.position ||
			!buffersMalchus?.indices ||
			objectMalchus.indicesCount <= 0
		) {
			return;
		}

		const gl = this.gl;
		const modelViewMalchus = mat4_core.identity();
		mat4_core.multiply(
			modelViewMalchus,
			contextBinah.viewMatrix,
			contextBinah.worldModelMatrix
		);
		const environmentBinah = createWaterEnvironmentState(
			objectMalchus,
			contextBinah
		);

		gl.useProgram(this.program);
		this.uniforms.bind({
			environment: environmentBinah,
			modelMatrix: contextBinah.worldModelMatrix,
			modelViewMatrix: modelViewMalchus,
			projectionMatrix: contextBinah.projectionMatrix
		});
		this.attributes.bind(buffersMalchus);
		gl.bindBuffer(
			gl.ELEMENT_ARRAY_BUFFER,
			buffersMalchus.indices
		);
		gl.drawElements(
			gl.TRIANGLES,
			objectMalchus.indicesCount,
			buffersMalchus.indexType || gl.UNSIGNED_SHORT,
			0
		);
	}
}
