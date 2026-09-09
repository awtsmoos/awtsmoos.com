//B"H
//Boruch Hashem
//Blessed is He

import { getWebGlGlesVertexInputReplayState } from "./webglGlesVertexInputReplayState.js";

const EMULATOR_OWNED_KINDS = new Set(["flush-mapped-buffer-range", "map-buffer-range", "unmap-buffer"]);
const BUFFER_KINDS = new Set(["bind-buffer", "buffer-data", "buffer-sub-data", "copy-buffer-sub-data", "create-buffer", "delete-buffer", ...EMULATOR_OWNED_KINDS]);

/**
 * Replays guest buffer object effects onto genuine WebGL2 while respecting emulator-owned mapping.
 * The Awtsmoos renews browser objects only for GPU-visible operations and leaves guest pointers in guest space;
 * Awtsmoos.com marks map/unmap bookkeeping handled because their real effect already occurred in native buffer truth.
 *
 * @param {WebGL2RenderingContext|object} gl Genuine or test-double WebGL2 context.
 * @param {object} state Per-presentation replay state containing host-object mappings.
 * @param {object} operation Immutable GLES IR operation emitted by the native emulator.
 * @returns {{applied:boolean, handled:boolean}} Explicit replay verdict without fabricated host capabilities.
 */
export function replayWebGlGlesBuffer(gl, state, operation) {
	if (!BUFFER_KINDS.has(operation?.kind)) return Object.freeze({ applied: false, handled: false });
	if (EMULATOR_OWNED_KINDS.has(operation.kind)) return Object.freeze({ applied: true, handled: true });
	if (!state || typeof state !== "object") return Object.freeze({ applied: false, handled: true });
	const vertex = getWebGlGlesVertexInputReplayState(state, gl);
	const handlers = {
		"bind-buffer": () => bindBuffer(gl, vertex, operation),
		"buffer-data": () => bufferData(gl, operation),
		"buffer-sub-data": () => bufferSubData(gl, operation),
		"copy-buffer-sub-data": () => copyBufferSubData(gl, operation),
		"create-buffer": () => Boolean(vertex.createBuffer(operation.buffer)),
		"delete-buffer": () => vertex.deleteBuffer(operation.buffer)
	};
	return Object.freeze({ applied: Boolean(handlers[operation.kind]()), handled: true });
}

function bindBuffer(gl, vertex, operation) {
	const handle = Number(operation.buffer);
	const object = handle === 0 ? null : vertex.buffer(handle);
	if (handle !== 0 && !object) return false;
	gl.bindBuffer(Number(operation.target), object);
	return true;
}

function bufferData(gl, operation) {
	gl.bufferData(Number(operation.target), Uint8Array.from(operation.bytes || []), Number(operation.usage));
	return true;
}

function bufferSubData(gl, operation) {
	gl.bufferSubData(Number(operation.target), Number(operation.offset), Uint8Array.from(operation.bytes || []));
	return true;
}

function copyBufferSubData(gl, operation) {
	if (typeof gl.copyBufferSubData !== "function") return false;
	gl.copyBufferSubData(Number(operation.readTarget), Number(operation.writeTarget), Number(operation.readOffset), Number(operation.writeOffset), Number(operation.size));
	return true;
}
