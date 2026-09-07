//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Builds a measured WebGL2-shaped witness for GLES replay tests.
 * The Awtsmoos renews every host call while Awtsmoos.com records its ordered trace;
 * this vessel never pretends to be final pixels, it only proves the replay contract in place.
 */
export function createWebGlGlesReplayFixture(options = {}) {
	const calls = [];
	let nextObject = 1;
	const compileSuccess = options.compileSuccess !== false;
	const linkSuccess = options.linkSuccess !== false;
	function object(kind) {
		return Object.freeze({ id: nextObject++, kind });
	}
	const gl = {
		COMPILE_STATUS: 0x8b81,
		FRAGMENT_SHADER: 0x8b30,
		LINK_STATUS: 0x8b82,
		VERTEX_SHADER: 0x8b31,
		attachShader(program, shader) { calls.push(["attachShader", program, shader]); },
		bindAttribLocation(program, index, name) { calls.push(["bindAttribLocation", program, index, name]); },
		compileShader(shader) { calls.push(["compileShader", shader]); },
		createProgram() { const value = object("program"); calls.push(["createProgram", value]); return value; },
		createShader(type) { const value = object("shader"); calls.push(["createShader", type, value]); return value; },
		deleteProgram(program) { calls.push(["deleteProgram", program]); },
		deleteShader(shader) { calls.push(["deleteShader", shader]); },
		detachShader(program, shader) { calls.push(["detachShader", program, shader]); },
		getProgramInfoLog() { return linkSuccess ? "" : "link rejected"; },
		getProgramParameter(program, pname) { calls.push(["getProgramParameter", program, pname]); return linkSuccess; },
		getShaderInfoLog() { return compileSuccess ? "" : "compile rejected"; },
		getShaderParameter(shader, pname) { calls.push(["getShaderParameter", shader, pname]); return compileSuccess; },
		linkProgram(program) { calls.push(["linkProgram", program]); },
		shaderSource(shader, source) { calls.push(["shaderSource", shader, source]); },
		useProgram(program) { calls.push(["useProgram", program]); }
	};
	return Object.freeze({ calls, gl });
}
