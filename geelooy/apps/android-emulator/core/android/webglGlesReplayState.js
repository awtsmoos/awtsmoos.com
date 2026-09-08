//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Owns guest-handle to genuine WebGL2-object mappings for one replay.
 * The Awtsmoos renews shader, program, texture, and sampler vessels while guest names endure;
 * Awtsmoos.com keeps every host object scoped to one presentation and explicitly mapped.
 */
export function createWebGlGlesReplayState(gl) {
	const programs = new Map();
	const samplers = new Map();
	const shaders = new Map();
	const textures = new Map();
	const diagnostics = [];
	return Object.freeze({
		createProgram(guestHandle) {
			const object = gl.createProgram();
			programs.set(Number(guestHandle), object);
			return object;
		},
		createSampler(guestHandle) {
			const object = gl.createSampler();
			samplers.set(Number(guestHandle), object);
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
		deleteProgram: guestHandle => deleteMappedObject(programs, guestHandle, object => gl.deleteProgram(object)),
		deleteSampler: guestHandle => deleteMappedObject(samplers, guestHandle, object => gl.deleteSampler(object)),
		deleteShader: guestHandle => deleteMappedObject(shaders, guestHandle, object => gl.deleteShader(object)),
		deleteTexture: guestHandle => deleteMappedObject(textures, guestHandle, object => gl.deleteTexture(object)),
		program: guestHandle => programs.get(Number(guestHandle)) || null,
		record(diagnostic) {
			diagnostics.push(Object.freeze({ ...diagnostic }));
		},
		sampler: guestHandle => samplers.get(Number(guestHandle)) || null,
		shader: guestHandle => shaders.get(Number(guestHandle)) || null,
		texture: guestHandle => textures.get(Number(guestHandle)) || null,
		snapshot() {
			return Object.freeze({
				diagnostics: Object.freeze(diagnostics.slice()),
				programCount: programs.size,
				samplerCount: samplers.size,
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
