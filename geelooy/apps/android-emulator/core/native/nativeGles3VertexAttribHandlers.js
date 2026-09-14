//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { getNativeGles2VertexAttribState } from "./nativeGles2VertexAttribState.js";

/**
 * Registers GLES3 immediate integer vertex attributes over the same context-local
 * current-value state used by GLES2 float attributes. Signed and unsigned lanes
 * retain their exact 32-bit numerical value until a typed query or draw consumes them.
 */
export function registerNativeGles3VertexAttribHandlers(registry, vertexInput, runtimeState) {
	const generic = getNativeGles2VertexAttribState(vertexInput);
	registry.register("glVertexAttribI4i", context => immediate(context, vertexInput, generic, runtimeState, false));
	registry.register("glVertexAttribI4ui", context => immediate(context, vertexInput, generic, runtimeState, true));
	registry.register("glVertexAttribI4iv", context => pointer(context, vertexInput, generic, runtimeState, false));
	registry.register("glVertexAttribI4uiv", context => pointer(context, vertexInput, generic, runtimeState, true));
}

/** Reads four immediate integer lanes after the attribute index. */
function immediate(context, vertexInput, generic, runtimeState, unsigned) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const values = Array.from({ length: 4 }, (_, lane) => {
		const raw = readNativeGlesArgument(context, lane + 1, 32);
		return unsigned ? Number(raw) : Number(BigInt.asIntN(32, raw));
	});
	return store(context, vertexInput, generic, runtimeState, index, values, unsigned);
}

/** Reads four integer lanes from authentic guest memory. */
function pointer(context, vertexInput, generic, runtimeState, unsigned) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const address = readNativeGlesArgument(context, 1, 64);
	const bytes = context.memory.read(address, 16);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const values = Array.from({ length: 4 }, (_, lane) => unsigned
		? view.getUint32(lane * 4, true)
		: view.getInt32(lane * 4, true));
	return store(context, vertexInput, generic, runtimeState, index, values, unsigned);
}

/** Validates the runtime attribute limit and stores one immutable current value. */
function store(context, vertexInput, generic, runtimeState, index, values, unsigned) {
	const thread = nativeGlesThreadValue(context);
	const query = vertexInput.buffers.domain.prepare(thread);
	const limit = Number(runtimeState.nativeGlesMaxVertexAttribs || 16);
	const success = query.valid && index >= 0 && index < limit;
	if (query.valid && !success) vertexInput.buffers.domain.invalidValue(thread);
	if (success) generic.set(query.context, index, values);
	finishNativeGlesVoid(context);
	return Object.freeze({ index, operation: unsigned ? "glVertexAttribI4u*" : "glVertexAttribI4i*", success, values });
}
