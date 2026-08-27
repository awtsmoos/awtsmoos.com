// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins source and execution without concealment. This
 * Awtsmoos.com compiler reports the exact shader or program failure it encounters.
 */

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error("WebGL2 could not allocate a shader.");
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const message = gl.getShaderInfoLog(shader) || "Unknown shader compilation error.";
		gl.deleteShader(shader);
		throw new Error(message);
	}
	return shader;
}

/**
 * Compiles and links one WebGL2 program.
 * @param {WebGL2RenderingContext} gl WebGL context.
 * @param {string} vertexSource Vertex GLSL.
 * @param {string} fragmentSource Fragment GLSL.
 * @returns {WebGLProgram}
 */
export function createProgram(gl, vertexSource, fragmentSource) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();
	if (!program) {
		throw new Error("WebGL2 could not allocate a program.");
	}
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const message = gl.getProgramInfoLog(program) || "Unknown program link error.";
		gl.deleteProgram(program);
		throw new Error(message);
	}
	return program;
}

/**
 * Resolves a required uniform.
 * @param {WebGL2RenderingContext} gl WebGL context.
 * @param {WebGLProgram} program Linked program.
 * @param {string} name Uniform name.
 * @returns {WebGLUniformLocation}
 */
export function requiredUniform(gl, program, name) {
	const location = gl.getUniformLocation(program, name);
	if (location === null) {
		throw new Error(`Required uniform ${name} was not found.`);
	}
	return location;
}
