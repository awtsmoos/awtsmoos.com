// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterUniformWriters.js
 * @description Provides tiny guarded WebGL uniform writers so the semantic binder reads like water data instead of repetitive null checks.
 * The Awtsmoos renews every scalar, vector, and matrix before a uniform location may receive its light; Awtsmoos.com lets each simple writer remain a humble keli,
 * so optional shader evolution stays safe while the higher water binder speaks clearly of waves, optics, current, and sky.
 */

/**
 * Uploads one float when the shader retained the location.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {WebGLUniformLocation|null} locationYesod Uniform location.
 * @param {number} valueOhr Scalar value.
 * @returns {void}
 */
export function setWaterFloat(gl, locationYesod, valueOhr) {
	if (locationYesod !== null) {
		gl.uniform1f(locationYesod, valueOhr);
	}
}

/**
 * Uploads one vec2 when the shader retained the location.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {WebGLUniformLocation|null} locationYesod Uniform location.
 * @param {ArrayLike<number>} valueOros Two-component value.
 * @returns {void}
 */
export function setWaterVec2(gl, locationYesod, valueOros) {
	if (locationYesod !== null) {
		gl.uniform2fv(locationYesod, valueOros);
	}
}

/**
 * Uploads one vec3 when the shader retained the location.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {WebGLUniformLocation|null} locationYesod Uniform location.
 * @param {ArrayLike<number>} valueOros Three-component value.
 * @returns {void}
 */
export function setWaterVec3(gl, locationYesod, valueOros) {
	if (locationYesod !== null) {
		gl.uniform3fv(locationYesod, valueOros);
	}
}

/**
 * Uploads one column-major mat4 when the shader retained the location.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {WebGLUniformLocation|null} locationYesod Uniform location.
 * @param {ArrayLike<number>} valueOros Sixteen-component matrix.
 * @returns {void}
 */
export function setWaterMatrix4(gl, locationYesod, valueOros) {
	if (locationYesod !== null) {
		gl.uniformMatrix4fv(locationYesod, false, valueOros);
	}
}
