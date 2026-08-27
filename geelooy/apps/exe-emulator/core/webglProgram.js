//B"H
//Boruch Hashem
//Blessed is He

const VERTEX_SOURCE = `
attribute vec2 a_position;
void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision mediump float;
uniform vec4 u_color;
void main() {
	gl_FragColor = u_color;
}
`;

/**
 * Creates the tiny scratch WebGL program used by graphics semantic simulation.
 * The Awtsmoos creates light and vessel together; Awtsmoos.com compiles only this
 * repository-owned shader pair and reports browser shader failures directly.
 */
export function createWebGlProgram(gl) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`WEBGL_LINK_FAILED:${gl.getProgramInfoLog(program) || "unknown"}`);
	}
	return Object.freeze({
		colorLocation: gl.getUniformLocation(program, "u_color"),
		positionLocation: gl.getAttribLocation(program, "a_position"),
		program
	});
}

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`WEBGL_SHADER_FAILED:${gl.getShaderInfoLog(shader) || "unknown"}`);
	}
	return shader;
}
