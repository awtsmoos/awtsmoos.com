//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Owns guest-handle to genuine WebGL2-object mappings for one replay.
 * The Awtsmoos renews finite shader and program vessels while their guest names endure;
 * Awtsmoos.com keeps host objects scoped to one presentation, explicit and secure.
 */

/**
 * Creates the mutable object map used during one ordered graphics replay.
 * @param {WebGL2RenderingContext} gl Genuine WebGL2 context receiving guest work.
 * @returns {Readonly<object>} Scoped replay state and immutable evidence accessors.
 */
export function createWebGlGlesReplayState(gl) {
	const programs = new Map();
	const shaders = new Map();
	const diagnostics = [];
	return Object.freeze({
		createProgram(guestHandle) {
			const object = gl.createProgram();
			programs.set(Number(guestHandle), object);
			return object;
		},
		createShader(guestHandle, shaderType) {
			const type = normalizeShaderType(gl, shaderType);
			if (type === null) return null;
			const object = gl.createShader(type);
			shaders.set(Number(guestHandle), object);
			return object;
		},
		deleteProgram(guestHandle) {
			const handle = Number(guestHandle);
			const object = programs.get(handle);
			if (object) gl.deleteProgram(object);
			programs.delete(handle);
			return Boolean(object);
		},
		deleteShader(guestHandle) {
			const handle = Number(guestHandle);
			const object = shaders.get(handle);
			if (object) gl.deleteShader(object);
			shaders.delete(handle);
			return Boolean(object);
		},
		program(guestHandle) {
			return programs.get(Number(guestHandle)) || null;
		},
		record(diagnostic) {
			diagnostics.push(Object.freeze({ ...diagnostic }));
		},
		shader(guestHandle) {
			return shaders.get(Number(guestHandle)) || null;
		},
		snapshot() {
			return Object.freeze({
				diagnostics: Object.freeze(diagnostics.slice()),
				programCount: programs.size,
				shaderCount: shaders.size
			});
		}
	});
}

/** Maps guest GLES shader enums to the actual WebGL2 enum surface. */
function normalizeShaderType(gl, value) {
	const type = Number(value);
	if (type === 0x8b31) return gl.VERTEX_SHADER;
	if (type === 0x8b30) return gl.FRAGMENT_SHADER;
	return null;
}
