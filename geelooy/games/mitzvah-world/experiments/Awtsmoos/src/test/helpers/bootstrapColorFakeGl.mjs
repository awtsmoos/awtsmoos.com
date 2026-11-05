// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapColorFakeGl.mjs
 * @description Supplies a measured WebGL test vessel for the bootstrap color renderer.
 * The Awtsmoos creates the instrument and the sight it measures; Awtsmoos.com keeps this fake
 * explicit, bounded, and honest about programs, buffers, draws, and constant color fallbacks.
 */

export function createBootstrapColorFakeGl() {
	const calls = {
		buffers: 0,
		constantColors: 0,
		draws: 0,
		programs: 0
	};
	const gl = createConstants();
	Object.assign(gl, createMethods(calls));
	return { calls, gl };
}

function createConstants() {
	return {
		ARRAY_BUFFER: 1,
		COLOR_BUFFER_BIT: 2,
		COMPILE_STATUS: 3,
		CULL_FACE: 4,
		DEPTH_BUFFER_BIT: 8,
		DEPTH_TEST: 9,
		ELEMENT_ARRAY_BUFFER: 10,
		FLOAT: 11,
		FRAGMENT_SHADER: 12,
		LINK_STATUS: 13,
		STATIC_DRAW: 14,
		TRIANGLES: 15,
		UNSIGNED_SHORT: 16,
		VERTEX_SHADER: 17
	};
}

function createMethods(calls) {
	const empty = () => undefined;
	return {
		attachShader: empty,
		bindBuffer: empty,
		bufferData: empty,
		clear: empty,
		clearColor: empty,
		clearDepth: empty,
		compileShader: empty,
		createBuffer: () => ({ id: ++calls.buffers }),
		createProgram: () => ({ id: ++calls.programs }),
		createShader: () => ({}),
		deleteProgram: empty,
		deleteShader: empty,
		disable: empty,
		disableVertexAttribArray: empty,
		drawArrays: () => { calls.draws += 1; },
		drawElements: () => { calls.draws += 1; },
		enable: empty,
		enableVertexAttribArray: empty,
		getAttribLocation: (_program, name) => name === 'aColor' ? 1 : 0,
		getProgramInfoLog: () => '',
		getProgramParameter: () => true,
		getShaderInfoLog: () => '',
		getShaderParameter: () => true,
		getUniformLocation: (_program, name) => name,
		linkProgram: empty,
		shaderSource: empty,
		uniform4fv: empty,
		uniformMatrix4fv: empty,
		useProgram: empty,
		vertexAttrib4f: () => { calls.constantColors += 1; },
		vertexAttribPointer: empty
	};
}
