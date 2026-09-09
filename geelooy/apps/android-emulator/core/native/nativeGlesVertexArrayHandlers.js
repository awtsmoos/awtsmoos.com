//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesNames, writeNativeGlesNames } from "./nativeGlesNameArray.js";

/** Registers VAO lifecycle and classic vertex attribute format calls. */
export function registerNativeGlesVertexArrayHandlers(registry, state) {
	for (const name of ["glBindVertexArray", "glBindVertexArrayOES"]) registry.register(name, context => bindVertexArray(context, state, name));
	for (const name of ["glDeleteVertexArrays", "glDeleteVertexArraysOES"]) registry.register(name, context => deleteVertexArrays(context, state, name));
	for (const name of ["glGenVertexArrays", "glGenVertexArraysOES"]) registry.register(name, context => genVertexArrays(context, state, name));
	for (const name of ["glIsVertexArray", "glIsVertexArrayOES"]) registry.register(name, context => isVertexArray(context, state, name));
	registry.register("glEnableVertexAttribArray", context => setEnabled(context, state, true));
	registry.register("glDisableVertexAttribArray", context => setEnabled(context, state, false));
	registry.register("glVertexAttribPointer", context => vertexPointer(context, state, false));
	registry.register("glVertexAttribIPointer", context => vertexPointer(context, state, true));
	registry.register("glVertexAttribDivisor", context => vertexDivisor(context, state));
	registry.register("glVertexAttribDivisorANGLE", context => vertexDivisor(context, state));
}

function bindVertexArray(context, state, operation) {
	const vertexArray = Number(readNativeGlesArgument(context, 0, 32));
	const success = state.bind(vertexArray, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation, success, vertexArray });
}
function deleteVertexArrays(context, state, operation) {
	const count = readNativeGlesSigned32(context, 0);
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return failValue(context, state, operation, count);
	const names = readNativeGlesNames(context.memory, address, count);
	const success = state.delete(names, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names, operation, success });
}
function genVertexArrays(context, state, operation) {
	const count = readNativeGlesSigned32(context, 0);
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return failValue(context, state, operation, count);
	const outcome = state.generate(count, nativeGlesThreadValue(context));
	if (outcome.success && count > 0) writeNativeGlesNames(context.memory, address, outcome.names);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names: outcome.names, operation, success: outcome.success });
}
function isVertexArray(context, state, operation) {
	const vertexArray = Number(readNativeGlesArgument(context, 0, 32));
	const value = state.is(vertexArray, nativeGlesThreadValue(context)) ? 1 : 0;
	finishNativeGlesValue(context, value, 32);
	return Object.freeze({ operation, result: value, success: true, vertexArray });
}
function setEnabled(context, state, enabled) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const success = enabled ? state.enable(index, nativeGlesThreadValue(context)) : state.disable(index, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ index, operation: enabled ? "glEnableVertexAttribArray" : "glDisableVertexAttribArray", success });
}
function vertexPointer(context, state, integer) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const size = readNativeGlesSigned32(context, 1);
	const type = Number(readNativeGlesArgument(context, 2, 32));
	const normalized = integer ? false : Number(readNativeGlesArgument(context, 3, 32)) !== 0;
	const strideIndex = integer ? 3 : 4;
	const stride = readNativeGlesSigned32(context, strideIndex);
	const offset = Number(readNativeGlesArgument(context, strideIndex + 1, 64));
	const success = state.pointer(index, size, type, normalized, stride, offset, integer, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ index, integer, normalized, offset, operation: integer ? "glVertexAttribIPointer" : "glVertexAttribPointer", size, stride, success, type });
}
function vertexDivisor(context, state) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const divisor = Number(readNativeGlesArgument(context, 1, 32));
	const success = state.divisor(index, divisor, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ divisor, index, operation: "glVertexAttribDivisor", success });
}
function failValue(context, state, operation, count) {
	state.domain.invalidValue(nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, operation, success: false });
}
