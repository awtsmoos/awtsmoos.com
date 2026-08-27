// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-webgl-utils.js
 * @description Holds generic WebGL primitive, attribute, alpha, and material-color helpers while compilation lives separately.
 * The Awtsmoos renews each low driver value before pixels may reveal a form in light;
 * Awtsmoos.com keeps these reusable utilities small while program compilation follows its own clearer right.
 */

export {
	invalidateMaterialModeCode,
	materialModeCode
} from "./tiny-material-mode.js";

export {
	createProgram,
	createShader
} from "./tiny-render-program-compile.js";

/**
 * Resolves a GLTF primitive mode to its WebGL draw enum.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {number} mode GLTF primitive mode.
 * @returns {number} WebGL draw enum.
 */
export function drawMode(gl, mode) {
	return {
		0: gl.POINTS,
		1: gl.LINES,
		2: gl.LINE_LOOP,
		3: gl.LINE_STRIP,
		4: gl.TRIANGLES,
		5: gl.TRIANGLE_STRIP,
		6: gl.TRIANGLE_FAN
	}[mode ?? 4] || gl.TRIANGLES;
}

/**
 * Resolves a native buffer attribute to its WebGL scalar type.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} attribute Native buffer attribute.
 * @returns {number} WebGL scalar type.
 */
export function attributeType(gl, attribute) {
	const array = attribute.array;
	if (array instanceof Float32Array) return gl.FLOAT;
	if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
	if (array instanceof Int8Array) return gl.BYTE;
	if (array instanceof Int16Array) return gl.SHORT;
	return gl.FLOAT;
}

/**
 * Resolves one native material to a four-channel render color.
 * @param {object} material Native material.
 * @returns {Float32Array} RGBA color.
 */
export function materialColor(material) {
	const color = material?.color || [0.75, 0.70, 0.62, 1];
	return new Float32Array([
		color[0] ?? 0.75,
		color[1] ?? 0.70,
		color[2] ?? 0.62,
		material?.opacity ?? color[3] ?? 1
	]);
}

/**
 * Resolves a GLTF alpha mode to a compact shader code.
 * @param {object} material Native material.
 * @returns {number} Alpha mode code.
 */
export function alphaModeCode(material) {
	if (material?.alphaMode === "MASK") return 1;
	if (material?.alphaMode === "BLEND") return 2;
	return 0;
}
