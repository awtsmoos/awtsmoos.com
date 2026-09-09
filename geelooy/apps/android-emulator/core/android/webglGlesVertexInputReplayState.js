//B"H
//Boruch Hashem
//Blessed is He

const STATES = new WeakMap();

/** Maps guest buffer and VAO names to genuine WebGL2 objects outside the base replay state. */
export function getWebGlGlesVertexInputReplayState(state, gl) {
	if (!STATES.has(state)) {
		const buffers = new Map();
		const vertexArrays = new Map();
		STATES.set(state, Object.freeze({
			buffer: handle => buffers.get(Number(handle)) || null,
			createBuffer(handle) {
				const object = gl.createBuffer();
				if (object) buffers.set(Number(handle), object);
				return object;
			},
			createVertexArray(handle) {
				const object = gl.createVertexArray();
				if (object) vertexArrays.set(Number(handle), object);
				return object;
			},
			deleteBuffer(handle) { return deleteObject(buffers, handle, object => gl.deleteBuffer(object)); },
			deleteVertexArray(handle) { return deleteObject(vertexArrays, handle, object => gl.deleteVertexArray(object)); },
			vertexArray: handle => vertexArrays.get(Number(handle)) || null
		}));
	}
	return STATES.get(state);
}
function deleteObject(map, handleValue, remove) {
	const handle = Number(handleValue);
	const object = map.get(handle);
	if (object) remove(object);
	map.delete(handle);
	return Boolean(object);
}
