//B"H
//Boruch Hashem
//Blessed is He

import { getWebGlGlesVertexInputReplayState } from "./webglGlesVertexInputReplayState.js";

const BUFFER_KINDS = new Set(["bind-buffer", "buffer-data", "buffer-sub-data", "copy-buffer-sub-data", "create-buffer", "delete-buffer"]);

/** Replays guest buffer lifecycle and byte transfers onto genuine WebGL2 buffers. */
export function replayWebGlGlesBuffer(gl, state, operation) {
	if (!BUFFER_KINDS.has(operation?.kind)) return Object.freeze({ applied: false, handled: false });
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
