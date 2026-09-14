//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { getNativeGles2VertexAttribState } from "./nativeGles2VertexAttribState.js";
import { writeNativeGlesInt32Values, writeNativeGlesUint32Values } from "./nativeGlesQueryMemory.js";

const CURRENT_VALUE = 0x8626;
const ARRAY_INTEGER = 0x88fd;

/** Registers signed and unsigned GLES3 integer vertex-attribute queries. */
export function registerNativeGles3VertexAttribQueryHandlers(registry, vertexInput, runtimeState) {
	const generic = getNativeGles2VertexAttribState(vertexInput);
	registry.register("glGetVertexAttribIiv", context => query(context, vertexInput, generic, runtimeState, false));
	registry.register("glGetVertexAttribIuiv", context => query(context, vertexInput, generic, runtimeState, true));
}

/** Writes one current-value or array-state property using its exact integer representation. */
function query(context, vertexInput, generic, runtimeState, unsigned) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const destination = readNativeGlesArgument(context, 2, 64);
	const thread = nativeGlesThreadValue(context);
	const prepared = vertexInput.buffers.domain.prepare(thread);
	let success = prepared.valid && validIndex(index, runtimeState);
	if (prepared.valid && !success) vertexInput.buffers.domain.invalidValue(thread);
	let values = [];
	if (success && pname === CURRENT_VALUE) values = generic.get(prepared.context, index);
	else if (success) values = arrayProperty(vertexInput, prepared.context, index, pname);
	if (success && !values) {
		vertexInput.buffers.domain.invalidEnum(thread);
		success = false;
	}
	if (success) {
		const writer = unsigned ? writeNativeGlesUint32Values : writeNativeGlesInt32Values;
		writer(context.memory, destination, values);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({ index, operation: unsigned ? "glGetVertexAttribIuiv" : "glGetVertexAttribIiv", pname, success });
}

/** Returns one GLES integer-array property from the current VAO record. */
function arrayProperty(vertexInput, context, index, pname) {
	const record = vertexInput.contexts.get(context).currentVao.attributes.get(index) || {};
	if (pname === ARRAY_INTEGER) return [record.integer ? 1 : 0];
	if (pname === 0x8622) return [record.enabled ? 1 : 0];
	if (pname === 0x8623) return [record.size ?? 4];
	if (pname === 0x8624) return [record.stride ?? 0];
	if (pname === 0x8625) return [record.type ?? 0x1406];
	if (pname === 0x889f) return [record.buffer?.handle ?? 0];
	if (pname === 0x88fe) return [record.divisor ?? 0];
	return null;
}

function validIndex(index, runtimeState) {
	return index >= 0 && index < Number(runtimeState.nativeGlesMaxVertexAttribs || 16);
}
