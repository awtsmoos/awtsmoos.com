//B"H
//Boruch Hashem
//Blessed is He

import { getWebGlGlesVertexInputReplayState } from "./webglGlesVertexInputReplayState.js";

const VERTEX_KINDS = new Set(["bind-vertex-array", "create-vertex-array", "delete-vertex-array", "disable-vertex-attrib", "enable-vertex-attrib", "vertex-attrib-divisor", "vertex-attrib-pointer"]);

/** Replays guest VAO and classic attribute state on genuine WebGL2 vertex arrays. */
export function replayWebGlGlesVertexArray(gl, state, operation) {
	if (!VERTEX_KINDS.has(operation?.kind)) return Object.freeze({ applied: false, handled: false });
	if (!state || typeof state !== "object") return Object.freeze({ applied: false, handled: true });
	const vertex = getWebGlGlesVertexInputReplayState(state, gl);
	const handlers = {
		"bind-vertex-array": () => bindVertexArray(gl, vertex, operation),
		"create-vertex-array": () => Boolean(vertex.createVertexArray(operation.vertexArray)),
		"delete-vertex-array": () => vertex.deleteVertexArray(operation.vertexArray),
		"disable-vertex-attrib": () => callIndex(gl, "disableVertexAttribArray", operation),
		"enable-vertex-attrib": () => callIndex(gl, "enableVertexAttribArray", operation),
		"vertex-attrib-divisor": () => divisor(gl, operation),
		"vertex-attrib-pointer": () => pointer(gl, vertex, operation)
	};
	return Object.freeze({ applied: Boolean(handlers[operation.kind]()), handled: true });
}
function bindVertexArray(gl, vertex, operation) {
	const handle = Number(operation.vertexArray);
	const object = handle === 0 ? null : vertex.vertexArray(handle);
	if (handle !== 0 && !object) return false;
	gl.bindVertexArray(object);
	return true;
}
function pointer(gl, vertex, operation) {
	const buffer = vertex.buffer(operation.buffer);
	if (!buffer) return false;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	const args = [Number(operation.index), Number(operation.size), Number(operation.type)];
	if (operation.integer) gl.vertexAttribIPointer(...args, Number(operation.stride), Number(operation.offset));
	else gl.vertexAttribPointer(...args, Boolean(operation.normalized), Number(operation.stride), Number(operation.offset));
	return true;
}
function divisor(gl, operation) {
	if (typeof gl.vertexAttribDivisor !== "function") return false;
	gl.vertexAttribDivisor(Number(operation.index), Number(operation.divisor));
	return true;
}
function callIndex(gl, method, operation) {
	if (typeof gl[method] !== "function") return false;
	gl[method](Number(operation.index));
	return true;
}
