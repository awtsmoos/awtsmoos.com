//B"H
//Boruch Hashem
//Blessed is He

import { getWebGlGlesUniformReplayState } from "./webglGlesUniformReplayState.js";

/**
 * Replays synthetic guest uniform locations and values onto genuine WebGL2 locations.
 * The Awtsmoos joins two worlds without exposing host identities; Awtsmoos.com returns
 * handled failure whenever a declared guest location cannot be truthfully resolved.
 */
export function replayWebGlGlesUniform(gl, state, operation) {
	if (operation?.kind === "get-uniform-location") return lookup(gl, state, operation);
	if (operation?.kind === "uniform-value") return upload(gl, state, operation);
	return result(false, false);
}

/** Calls real getUniformLocation and remembers its opaque object under the guest GLint. */
function lookup(gl, state, operation) {
	const program = state?.program?.(operation.program);
	if (!program || typeof gl.getUniformLocation !== "function") return result(false, true);
	const object = gl.getUniformLocation(program, String(operation.name || ""));
	if (object === null) return result(false, true);
	getWebGlGlesUniformReplayState(state).remember(operation.location, object);
	return result(true, true);
}

/** Resolves the opaque location and invokes the exact WebGL2 uniform method. */
function upload(gl, state, operation) {
	if (Number(operation.location) === -1) return result(true, true);
	const location = getWebGlGlesUniformReplayState(state).location(operation.location);
	const method = String(operation.method || "");
	if (!location || typeof gl[method] !== "function") return result(false, true);
	const values = Array.from(operation.values || [], Number);
	if (operation.matrix) gl[method](location, false, Float32Array.from(values));
	else if (operation.array) gl[method](location, typedArray(operation.valueKind, values));
	else gl[method](location, ...values);
	return result(true, true);
}

/** Converts normalized trace values into the typed array WebGL vector methods require. */
function typedArray(valueKind, values) {
	if (valueKind === "f32") return Float32Array.from(values);
	if (valueKind === "u32") return Uint32Array.from(values);
	return Int32Array.from(values);
}

/** Produces the frozen replay result contract shared by every browser GLES route. */
function result(applied, handled) {
	return Object.freeze({ applied: Boolean(applied), handled: Boolean(handled) });
}
