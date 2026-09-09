//B"H
//Boruch Hashem
//Blessed is He

import { getWebGlGlesVertexInputReplayState } from "./webglGlesVertexInputReplayState.js";

const BUFFER_KINDS = new Set([
	"bind-buffer", "bind-buffer-base", "bind-buffer-range", "buffer-data",
	"buffer-map", "buffer-sub-data", "buffer-unmap", "copy-buffer-sub-data",
	"create-buffer", "delete-buffer"
]);

/**
 * Replays guest buffer lifecycle, indexed bindings, and byte transfers on genuine WebGL2.
 * CPU mapping remains emulator-owned; only guest-visible writeback bytes cross into WebGL.
 */
export function replayWebGlGlesBuffer(gl, state, operation) {
	if (!BUFFER_KINDS.has(operation?.kind)) return result(false, false);
	if (!state || typeof state !== "object") return result(false, true);
	if (["buffer-map", "buffer-unmap"].includes(operation.kind)) return result(true, true);
	const vertex = getWebGlGlesVertexInputReplayState(state, gl);
	const handlers = {
		"bind-buffer": () => bindBuffer(gl, vertex, operation),
		"bind-buffer-base": () => bindIndexed(gl, vertex, operation, false),
		"bind-buffer-range": () => bindIndexed(gl, vertex, operation, true),
		"buffer-data": () => bufferData(gl, operation),
		"buffer-sub-data": () => bufferSubData(gl, operation),
		"copy-buffer-sub-data": () => copyBufferSubData(gl, operation),
		"create-buffer": () => Boolean(vertex.createBuffer(operation.buffer)),
		"delete-buffer": () => vertex.deleteBuffer(operation.buffer)
	};
	return result(Boolean(handlers[operation.kind]()), true);
}

/** Resolves a guest buffer name and commits one ordinary WebGL2 target binding. */
function bindBuffer(gl, vertex, operation) {
	const object = resolveBuffer(vertex, operation.buffer);
	if (object === undefined) return false;
	gl.bindBuffer(Number(operation.target), object);
	return true;
}

/** Replays indexed base/range binding with the exact guest buffer object and byte range. */
function bindIndexed(gl, vertex, operation, ranged) {
	const object = resolveBuffer(vertex, operation.buffer);
	if (object === undefined) return false;
	const method = ranged ? "bindBufferRange" : "bindBufferBase";
	if (typeof gl[method] !== "function") return false;
	const args = [Number(operation.target), Number(operation.index), object];
	if (ranged) args.push(Number(operation.offset), Number(operation.size));
	gl[method](...args);
	return true;
}

/** Replays one complete allocation/upload using immutable traced guest bytes. */
function bufferData(gl, operation) {
	gl.bufferData(Number(operation.target), Uint8Array.from(operation.bytes || []), Number(operation.usage));
	return true;
}

/** Replays one partial guest upload, including mapped-range writeback operations. */
function bufferSubData(gl, operation) {
	gl.bufferSubData(Number(operation.target), Number(operation.offset), Uint8Array.from(operation.bytes || []));
	return true;
}

/** Replays a browser-native copy when WebGL2 truthfully exposes the operation. */
function copyBufferSubData(gl, operation) {
	if (typeof gl.copyBufferSubData !== "function") return false;
	gl.copyBufferSubData(Number(operation.readTarget), Number(operation.writeTarget), Number(operation.readOffset), Number(operation.writeOffset), Number(operation.size));
	return true;
}

/** Resolves zero as null and rejects unknown nonzero guest names without browser invention. */
function resolveBuffer(vertex, handleValue) {
	const handle = Number(handleValue);
	if (handle === 0) return null;
	return vertex.buffer(handle) || undefined;
}

/** Produces the frozen replay contract shared by every GLES browser route. */
function result(applied, handled) {
	return Object.freeze({ applied: Boolean(applied), handled: Boolean(handled) });
}
