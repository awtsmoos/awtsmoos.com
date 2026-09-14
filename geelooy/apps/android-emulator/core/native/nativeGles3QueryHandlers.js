//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesNames, writeNativeGlesNames } from "./nativeGlesNameArray.js";
import { writeNativeGlesInt32Values, writeNativeGlesUint32Values } from "./nativeGlesQueryMemory.js";

/** Registers the complete GLES3 core query-object lifecycle and result surface. */
export function registerNativeGles3QueryHandlers(registry, state) {
	registry.register("glGenQueries", context => generate(context, state));
	registry.register("glDeleteQueries", context => remove(context, state));
	registry.register("glIsQuery", context => isQuery(context, state));
	registry.register("glBeginQuery", context => begin(context, state));
	registry.register("glEndQuery", context => end(context, state));
	registry.register("glGetQueryiv", context => getQuery(context, state));
	registry.register("glGetQueryObjectuiv", context => getObject(context, state));
}

/** Generates bounded query names and writes them to guest memory. */
function generate(context, state) {
	const count = readNativeGlesSigned32(context, 0);
	const address = readNativeGlesArgument(context, 1, 64);
	const thread = nativeGlesThreadValue(context);
	if (count < 0) return failCount(context, state, count);
	const result = state.generate(count, thread);
	if (result.success && count) writeNativeGlesNames(context.memory, address, result.names);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names: result.names, operation: "glGenQueries", success: result.success });
}

/** Deletes non-active query names from the current context namespace. */
function remove(context, state) {
	const count = readNativeGlesSigned32(context, 0);
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return failCount(context, state, count);
	const names = readNativeGlesNames(context.memory, address, count);
	const success = state.delete(names, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names, operation: "glDeleteQueries", success });
}

function isQuery(context, state) {
	const query = Number(readNativeGlesArgument(context, 0, 32));
	const value = state.is(query, nativeGlesThreadValue(context)) ? 1 : 0;
	finishNativeGlesValue(context, value, 32);
	return Object.freeze({ operation: "glIsQuery", query, success: true, value });
}
function begin(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const query = Number(readNativeGlesArgument(context, 1, 32));
	const success = state.begin(target, query, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glBeginQuery", query, success, target });
}
function end(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const success = state.end(target, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glEndQuery", success, target });
}
function getQuery(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const address = readNativeGlesArgument(context, 2, 64);
	const result = state.query(target, pname, nativeGlesThreadValue(context));
	if (result.success) writeNativeGlesInt32Values(context.memory, address, [result.value]);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetQueryiv", pname, success: result.success, target, value: result.value });
}
function getObject(context, state) {
	const query = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const address = readNativeGlesArgument(context, 2, 64);
	const result = state.object(query, pname, nativeGlesThreadValue(context));
	if (result.success) writeNativeGlesUint32Values(context.memory, address, [result.value]);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetQueryObjectuiv", pname, query, success: result.success, value: result.value });
}
function failCount(context, state, count) { state.domain.invalidValue(nativeGlesThreadValue(context)); finishNativeGlesVoid(context); return Object.freeze({ count, operation: "query-count", success: false }); }
