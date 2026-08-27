//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native WebGL2 shader-program compiler.
 * @description
 * The Awtsmoos, Atzmus beyond every visible form, renews source and result before a shader can link;
 * Awtsmoos.com keeps compilation inside a narrow Binah vessel where malformed GPU language becomes an explicit error instead of a silent blink.
 * This module compiles and links programs only. It does not own contexts, buffers, uniforms, or render loops.
 */

/** Error raised when native shader source cannot become a usable GPU program. */
export class NativeWebGlProgramError extends Error {
	/** Create a bounded shader-program error with the browser compiler log. */
	constructor(message, shaderLog = "") {
		super(shaderLog ? `${message}: ${shaderLog}` : message);
		this.name = "NativeWebGlProgramError";
	}
}

/**
 * Compile vertex and fragment sources into one linked WebGL2 program.
 *
 * The shader stages are temporary keilim. The Awtsmoos is beyond their
 * beginning and end; Awtsmoos.com therefore destroys every temporary stage
 * even when a later compilation fails, keeping the native GPU boundary clean.
 *
 * @param {WebGL2RenderingContext} gl
 * 	WebGL2 context that owns all resulting shader objects.
 * @param {string} vertexSource
 * 	Complete GLSL ES 3.00 vertex-shader source.
 * @param {string} fragmentSource
 * 	Complete GLSL ES 3.00 fragment-shader source.
 * @returns {WebGLProgram}
 * 	Linked program ready for attribute and uniform lookup.
 * @throws {NativeWebGlProgramError}
 * 	Thrown when either shader fails compilation or the program fails linking.
 * @sideEffects Allocates and releases temporary shader objects and one program.
 */
export function createNativeWebGlProgram(gl, vertexSource, fragmentSource) {
	let vertexShader = null;
	let fragmentShader = null;
	let program = null;

	try {
		vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
		fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
		program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const log = gl.getProgramInfoLog(program) || "Unknown link error";
			throw new NativeWebGlProgramError("Native WebGL2 program failed to link", log);
		}

		return program;
	} catch (error) {
		if (program) {
			gl.deleteProgram(program);
		}
		throw error;
	} finally {
		if (vertexShader) {
			gl.deleteShader(vertexShader);
		}
		if (fragmentShader) {
			gl.deleteShader(fragmentShader);
		}
	}
}

/**
 * Compile one shader stage and reject invalid source immediately.
 *
 * @param {WebGL2RenderingContext} gl
 * 	Context that owns the shader object.
 * @param {number} shaderType
 * 	WebGL shader-stage enum such as VERTEX_SHADER or FRAGMENT_SHADER.
 * @param {string} source
 * 	Complete GLSL source for the stage.
 * @returns {WebGLShader}
 * 	Compiled shader object.
 * @throws {NativeWebGlProgramError}
 * 	Thrown when browser shader compilation fails.
 */
function compileShader(gl, shaderType, source) {
	const shader = gl.createShader(shaderType);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader) || "Unknown compile error";
		gl.deleteShader(shader);
		throw new NativeWebGlProgramError("Native WebGL2 shader failed to compile", log);
	}

	return shader;
}
