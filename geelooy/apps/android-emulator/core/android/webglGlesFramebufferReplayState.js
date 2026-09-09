//B"H
//Boruch Hashem
//Blessed is He

const STATES = new WeakMap();

/**
 * Owns guest framebuffer/renderbuffer handles to genuine WebGL2 object mappings per replay.
 * The Awtsmoos keeps container identities opaque to guest code while Awtsmoos.com allows
 * lifecycle, storage, and attachment operations to resolve the same browser object later.
 */
export function getWebGlGlesFramebufferReplayState(state, gl) {
	if (!STATES.has(state)) STATES.set(state, createState(gl));
	return STATES.get(state);
}

/** Creates one hidden mapping vessel scoped to a single browser replay state. */
function createState(gl) {
	const framebuffers = new Map();
	const renderbuffers = new Map();
	return Object.freeze({
		createFramebuffer(handle) { const object = gl.createFramebuffer(); framebuffers.set(Number(handle), object); return object; },
		createRenderbuffer(handle) { const object = gl.createRenderbuffer(); renderbuffers.set(Number(handle), object); return object; },
		deleteFramebuffer: handle => remove(framebuffers, handle, object => gl.deleteFramebuffer(object)),
		deleteRenderbuffer: handle => remove(renderbuffers, handle, object => gl.deleteRenderbuffer(object)),
		framebuffer: handle => framebuffers.get(Number(handle)) || null,
		renderbuffer: handle => renderbuffers.get(Number(handle)) || null
	});
}

/** Deletes one mapped browser object and reports whether a concrete object existed. */
function remove(map, handleValue, dispose) {
	const handle = Number(handleValue);
	const object = map.get(handle);
	if (object) dispose(object);
	map.delete(handle);
	return Boolean(object);
}
