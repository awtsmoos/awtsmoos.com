//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Owns guest-handle to genuine WebGL2-object mappings for one replay.
 * The Awtsmoos renews finite shader, program, and texture vessels while guest names endure;
 * Awtsmoos.com keeps host objects scoped to one presentation, explicit and secure.
 */

/** Creates the mutable object map used during one ordered graphics replay. */
export function createWebGlGlesReplayState(gl) {
	const programs = new Map();
	const shaders = new Map();
	const textures = new Map();
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
		createTexture(guestHandle) {
			const object = gl.createTexture();
			textures.set(Number(guestHandle), object);
			return object;
		},
		deleteProgram(guestHandle) {
			return deleteMappedObject(programs, guestHandle, object => gl.deleteProgram(object));
		},
		deleteShader(guestHandle) {
			return deleteMappedObject(shaders, guestHandle, object => gl.deleteShader(object));
		},
		deleteTexture(guestHandle) {
			return deleteMappedObject(textures, guestHandle, object => gl.deleteTexture(object));
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
		texture(guestHandle) {
			return textures.get(Number(guestHandle)) || null;
		},
		snapshot() {
			return Object.freeze({
				diagnostics: Object.freeze(diagnostics.slice()),
				programCount: programs.size,
				shaderCount: shaders.size,
				textureCount: textures.size
			});
		}
	});
}

function deleteMappedObject(map, guestHandle, remove) {
	const handle = Number(guestHandle);
	const object = map.get(handle);
	if (object) remove(object);
	map.delete(handle);
	return Boolean(object);
}

function normalizeShaderType(gl, value) {
	const type = Number(value);
	if (type === 0x8b31) return gl.VERTEX_SHADER;
	if (type === 0x8b30) return gl.FRAGMENT_SHADER;
	return null;
}
