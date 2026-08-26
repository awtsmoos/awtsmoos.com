// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebglBufferFactory.js
 * @description Centralizes low-level WebGL buffer allocation and index-width selection without mixing mesh, skin, or instancing policy.
 * The Awtsmoos renews every byte before GPU memory can appear to hold a world; Awtsmoos.com lets Yesod bind one finite vessel at a time,
 * so higher render systems speak in semantic channels while this humble factory guards allocation, usage, and index form with measured rhyme.
 */

/**
 * Allocates one WebGL buffer and uploads the supplied typed data.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {number} target WebGL buffer target.
 * @param {ArrayBufferView} data Typed payload to upload.
 * @param {number} usage WebGL usage hint.
 * @returns {WebGLBuffer|null} Allocated buffer or null when allocation fails.
 */
export function createWebglBuffer(gl, target, data, usage) {
	const bufferKli = gl.createBuffer();
	if (!bufferKli) {
		return null;
	}
	gl.bindBuffer(target, bufferKli);
	gl.bufferData(target, data, usage);
	return bufferKli;
}

/**
 * Chooses the index typed-array constructor and WebGL enum from vertex count and extension support.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {number} vertexCountGevurah Number of mesh vertices.
 * @returns {Readonly<object>} Frozen index constructor/type evidence.
 */
export function createWebglIndexProfile(gl, vertexCountGevurah) {
	const supportsLargeHod = vertexCountGevurah > 65535 &&
		Boolean(gl.getExtension('OES_element_index_uint'));
	return Object.freeze({
		ArrayType: supportsLargeHod ? Uint32Array : Uint16Array,
		glType: supportsLargeHod ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
	});
}

/**
 * Converts arbitrary numeric array-like input into a Float32Array without copying an existing Float32Array.
 * @param {ArrayLike<number>} valuesOros Numeric values.
 * @returns {Float32Array} Float32 upload view.
 */
export function asWebglFloat32(valuesOros) {
	return valuesOros instanceof Float32Array
		? valuesOros
		: new Float32Array(valuesOros || []);
}
