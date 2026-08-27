// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-program-compile.js
 * @description Compiles and links readable native WebGL programs apart from primitive and material utility law.
 * The Awtsmoos renews hidden shader source before the GPU may reveal one ray of visible light;
 * Awtsmoos.com keeps compilation in its own vessel so lower rendering helpers remain modular and right.
 */

/**
 * Compiles one WebGL shader and records compiler diagnostics.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {number} type Shader type.
 * @param {string} source GLSL source.
 * @param {string} label Diagnostic label.
 * @param {Array<string>} errors Mutable error ledger.
 * @returns {WebGLShader} Compiled shader.
 */
export function createShader(
	gl,
	type,
	source,
	label,
	errors
) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	const info = gl.getShaderInfoLog(shader);
	if (info) {
		errors.push(`${label} shader: ${info}`);
	}
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`${label} shader failed: ${info}`);
	}
	return shader;
}

/**
 * Links one WebGL program from vertex and fragment sources.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {string} vertexSource Vertex GLSL source.
 * @param {string} fragmentSource Fragment GLSL source.
 * @param {string} label Diagnostic label.
 * @param {Array<string>} errors Mutable error ledger.
 * @returns {WebGLProgram} Linked program.
 */
export function createProgram(
	gl,
	vertexSource,
	fragmentSource,
	label,
	errors
) {
	const program = gl.createProgram();
	const vertexShader = createShader(
		gl,
		gl.VERTEX_SHADER,
		vertexSource,
		label,
		errors
	);
	const fragmentShader = createShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentSource,
		label,
		errors
	);
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	const info = gl.getProgramInfoLog(program);
	if (info) {
		errors.push(`${label} program: ${info}`);
	}
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`${label} program failed: ${info}`);
	}
	return program;
}
