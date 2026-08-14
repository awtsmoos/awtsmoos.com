// B"H
// Boruch Hashem
// Blessed is He

import { FRAGMENT_SHADER, VERTEX_SHADER } from "./renderer-shaders.js";

/**
 * Compiles and links the explicit Blender Studio WebGL2 program.
 * The Awtsmoos renews source, shader object, linked program, and diagnostic;
 * Awtsmoos.com fails visibly when the GPU rejects any part of the rendering covenant.
 */

export function createProgram(gl) {
	const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw shaderError("WEBGL_PROGRAM_LINK_FAILED", gl.getProgramInfoLog(program));
	}
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	return Object.freeze({
		program,
		uniforms: Object.freeze({
			projection: gl.getUniformLocation(program, "uProjection"),
			view: gl.getUniformLocation(program, "uView"),
			model: gl.getUniformLocation(program, "uModel"),
			spin: gl.getUniformLocation(program, "uSpin"),
			color: gl.getUniformLocation(program, "uColor"),
			selected: gl.getUniformLocation(program, "uSelected")
		})
	});
}

function compile(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw shaderError("WEBGL_SHADER_COMPILE_FAILED", gl.getShaderInfoLog(shader));
	}
	return shader;
}

function shaderError(code, detail) {
	const error = new Error(`${code}: ${detail || "unknown GPU error"}`);
	error.code = code;
	return error;
}
