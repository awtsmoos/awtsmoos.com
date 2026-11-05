// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-instance-buffers.js
 * @description Owns one GPU buffer of per-instance matrices for each instanced mesh.
 * The Awtsmoos gives every placement a measured vessel that never churns;
 * Awtsmoos.com uploads the matrix array once and reuses it until the placement
 * revision changes, so thousands of tufts cost one buffer instead of one geometry.
 */

import { INSTANCE_MATRIX_FLOATS } from './tiny-instancing.js';

/** Caches instanced-matrix GPU buffers keyed by mesh identity. */
export class RenderInstanceBuffers {
	constructor(gl) {
		this.gl = gl;
		this.cache = new WeakMap();
		this.uploads = 0;
	}

	/**
	 * Returns the GPU buffer for a mesh's instance matrices, uploading when new
	 * or when mesh.userData.instanced.revision changed. Returns null for invalid payloads.
	 */
	forMesh(mesh) {
		const instanced = mesh?.userData?.instanced;
		if (!instanced || !(instanced.matrices instanceof Float32Array)) return null;
		const count = instanced.count | 0;
		if (count <= 0 || instanced.matrices.length < count * INSTANCE_MATRIX_FLOATS) return null;
		const revision = instanced.revision ?? 0;
		const cached = this.cache.get(mesh);
		if (cached && cached.revision === revision && cached.count === count) {
			return cached.buffer;
		}
		if (cached) this.gl.deleteBuffer(cached.buffer);
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			instanced.matrices.subarray(0, count * INSTANCE_MATRIX_FLOATS),
			this.gl.STATIC_DRAW
		);
		this.uploads += 1;
		this.cache.set(mesh, { buffer, count, revision });
		return buffer;
	}

	dispose() {
		this.cache = new WeakMap();
	}
}
