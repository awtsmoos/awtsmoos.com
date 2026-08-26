//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every shader instruction before compiled light can claim a separate reign;
 * Awtsmoos.com closes every failed GPU vessel cleanly so ambient beauty can never injure the game.
 */
export function createWebglProgram(gl, vertexSource, fragmentSource) {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	let fragmentShader = null;
	let program = null;

	try {
		fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
		program = gl.createProgram();
		if (!program) {
			throw new Error("particle_program_unavailable");
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const message = gl.getProgramInfoLog(program) || "unknown WebGL link error";
			throw new Error(`particle_program_link_failed: ${message}`);
		}

		return program;
	} catch (error) {
		if (program) {
			gl.deleteProgram(program);
		}
		throw error;
	} finally {
		gl.deleteShader(vertexShader);
		if (fragmentShader) {
			gl.deleteShader(fragmentShader);
		}
	}
}

/**
 * Compiles one shader and owns deletion when compilation itself fails.
 *
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 * @param {number} type WebGL shader type constant.
 * @param {string} source Shader source text.
 * @returns {WebGLShader} Successfully compiled shader.
 * @throws {Error} When allocation or compilation fails.
 */
function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error("particle_shader_unavailable");
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const message = gl.getShaderInfoLog(shader) || "unknown WebGL compile error";
		gl.deleteShader(shader);
		throw new Error(`particle_shader_compile_failed: ${message}`);
	}

	return shader;
}
