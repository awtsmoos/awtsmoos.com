//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import {
	finishNativeGlesVoid,
	nativeGlesThreadValue,
	writeNativeGlesInt32
} from "./nativeGlesHandlerSupport.js";
import { isNativeGlesBufferTarget } from "./nativeGlesBufferTargets.js";

const BUFFER_SIZE = 0x8764;
const BUFFER_USAGE = 0x8765;

/** Registers GLES2 buffer metadata queries against the actual bound byte store. */
export function registerNativeGles2BufferQueryHandlers(registry, vertexInput) {
	registry.register("glGetBufferParameteriv", context => queryBuffer(context, vertexInput));
}

/** Writes GL_BUFFER_SIZE or GL_BUFFER_USAGE for the current target binding. */
function queryBuffer(context, vertexInput) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const destination = readNativeGlesArgument(context, 2, 64);
	const thread = nativeGlesThreadValue(context);
	const query = vertexInput.buffers.domain.prepare(thread);
	let success = query.valid;
	let value = 0;
	if (success && !isNativeGlesBufferTarget(target)) {
		vertexInput.buffers.domain.invalidEnum(thread);
		success = false;
	}
	const record = success
		? vertexInput.buffers.boundRecord(query.context, target)
		: null;
	if (success && !record) {
		vertexInput.buffers.domain.invalidOperation(thread);
		success = false;
	}
	if (success && pname === BUFFER_SIZE) value = record.bytes.length;
	else if (success && pname === BUFFER_USAGE) value = record.usage;
	else if (success) {
		vertexInput.buffers.domain.invalidEnum(thread);
		success = false;
	}
	if (success) writeNativeGlesInt32(context.memory, destination, value);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetBufferParameteriv", pname, success, target, value });
}
