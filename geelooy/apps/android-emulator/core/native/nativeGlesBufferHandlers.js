//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesNames, writeNativeGlesNames } from "./nativeGlesNameArray.js";

const MAX_BUFFER_BYTES = 64 * 1024 * 1024;

/** Registers core ES buffer lifecycle and byte transfers against exact guest memory. */
export function registerNativeGlesBufferHandlers(registry, state) {
	registry.register("glBindBuffer", context => bindBuffer(context, state));
	registry.register("glBufferData", context => bufferData(context, state));
	registry.register("glBufferSubData", context => bufferSubData(context, state));
	registry.register("glCopyBufferSubData", context => copyBufferSubData(context, state));
	registry.register("glDeleteBuffers", context => deleteBuffers(context, state));
	registry.register("glGenBuffers", context => genBuffers(context, state));
	registry.register("glIsBuffer", context => isBuffer(context, state));
}

function bindBuffer(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const buffer = Number(readNativeGlesArgument(context, 1, 32));
	const success = state.bind(target, buffer, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ buffer, operation: "glBindBuffer", success, target });
}

function bufferData(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const size = boundedSize(readNativeGlesArgument(context, 1, 64));
	const address = readNativeGlesArgument(context, 2, 64);
	const usage = Number(readNativeGlesArgument(context, 3, 32));
	if (size === null) return failValue(context, state, "glBufferData");
	const bytes = address === 0n ? new Uint8Array(size) : context.memory.read(address, size);
	const success = state.data(target, bytes, usage, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glBufferData", size, success, target, usage });
}

function bufferSubData(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const offset = boundedSize(readNativeGlesArgument(context, 1, 64));
	const size = boundedSize(readNativeGlesArgument(context, 2, 64));
	const address = readNativeGlesArgument(context, 3, 64);
	if (offset === null || size === null || (size > 0 && address === 0n)) return failValue(context, state, "glBufferSubData");
	const bytes = size ? context.memory.read(address, size) : new Uint8Array();
	const success = state.subData(target, offset, bytes, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ offset, operation: "glBufferSubData", size, success, target });
}

function copyBufferSubData(context, state) {
	const readTarget = Number(readNativeGlesArgument(context, 0, 32));
	const writeTarget = Number(readNativeGlesArgument(context, 1, 32));
	const readOffset = boundedSize(readNativeGlesArgument(context, 2, 64));
	const writeOffset = boundedSize(readNativeGlesArgument(context, 3, 64));
	const size = boundedSize(readNativeGlesArgument(context, 4, 64));
	if ([readOffset, writeOffset, size].includes(null)) return failValue(context, state, "glCopyBufferSubData");
	const success = state.copy(readTarget, writeTarget, readOffset, writeOffset, size, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glCopyBufferSubData", readOffset, readTarget, size, success, writeOffset, writeTarget });
}

function deleteBuffers(context, state) {
	const count = signed32(readNativeGlesArgument(context, 0, 32));
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return failValue(context, state, "glDeleteBuffers", count);
	const names = readNativeGlesNames(context.memory, address, count);
	const success = state.delete(names, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names, operation: "glDeleteBuffers", success });
}

function genBuffers(context, state) {
	const count = signed32(readNativeGlesArgument(context, 0, 32));
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return failValue(context, state, "glGenBuffers", count);
	const outcome = state.generate(count, nativeGlesThreadValue(context));
	if (outcome.success && count > 0) writeNativeGlesNames(context.memory, address, outcome.names);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names: outcome.names, operation: "glGenBuffers", success: outcome.success });
}

function isBuffer(context, state) {
	const buffer = Number(readNativeGlesArgument(context, 0, 32));
	const value = state.is(buffer, nativeGlesThreadValue(context)) ? 1 : 0;
	finishNativeGlesValue(context, value, 32);
	return Object.freeze({ buffer, operation: "glIsBuffer", result: value, success: true });
}

function failValue(context, state, operation, count = null) {
	state.domain.invalidValue(nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, operation, success: false });
}
function boundedSize(value) {
	const signed = BigInt.asIntN(64, BigInt(value));
	return signed < 0n || signed > BigInt(MAX_BUFFER_BYTES) ? null : Number(signed);
}
function signed32(value) { return Number(BigInt.asIntN(32, BigInt(value))); }
