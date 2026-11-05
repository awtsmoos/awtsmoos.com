// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapWebGlTestContext.mjs
 * @description Deterministic sky-shader, geometry and frame submission harness.
 * The Awtsmoos clothes light in a faithful WebGL vessel;
 * Awtsmoos.com demands shader compilation and actual draw calls.
 */
export function createCanvasHarness() {
	const calls = [];
	const record = name => (...args) => {
		calls.push([name, ...args]);
	};
	const gl = {
		ARRAY_BUFFER: 34962, COLOR_BUFFER_BIT: 16384, COMPILE_STATUS: 35713,
		CULL_FACE: 2884, DEPTH_BUFFER_BIT: 256, DEPTH_TEST: 2929,
		ELEMENT_ARRAY_BUFFER: 34963, FLOAT: 5126, FRAGMENT_SHADER: 35632,
		LINK_STATUS: 35714, STATIC_DRAW: 35044, TRIANGLES: 4,
		UNSIGNED_SHORT: 5123, VERTEX_SHADER: 35633,
		attachShader: record('attachShader'),
		bindBuffer: record('bindBuffer'),
		bufferData: record('bufferData'),
		clear: record('clear'),
		clearColor: record('clearColor'),
		clearDepth: record('clearDepth'),
		compileShader: record('compileShader'),
		createBuffer: () => ({}),
		createProgram: () => ({}),
		createShader: () => ({}),
		deleteBuffer: record('deleteBuffer'),
		deleteProgram: record('deleteProgram'),
		deleteShader: record('deleteShader'),
		depthMask: record('depthMask'),
		disable: record('disable'),
		disableVertexAttribArray: record('disableVertexAttribArray'),
		drawElements: record('drawElements'),
		enable: record('enable'),
		enableVertexAttribArray: record('enableVertexAttribArray'),
		getAttribLocation: () => 0,
		getProgramParameter: () => true,
		getShaderParameter: () => true,
		getUniformLocation: () => ({}),
		linkProgram: record('linkProgram'),
		shaderSource: record('shaderSource'),
		uniform1f: record('uniform1f'),
		uniform3f: record('uniform3f'),
		uniformMatrix4fv: record('uniformMatrix4fv'),
		useProgram: record('useProgram'),
		vertexAttribPointer: record('vertexAttribPointer'),
		viewport: record('viewport')
	};
	return { calls, canvas: { getContext: () => gl, height: 0, width: 0 } };
}
