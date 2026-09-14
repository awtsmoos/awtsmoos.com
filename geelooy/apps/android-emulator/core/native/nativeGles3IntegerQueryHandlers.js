//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { writeNativeGlesInt64Values } from "./nativeGlesQueryMemory.js";

/**
 * Registers GLES3 64-bit scalar/vector state queries over the same modeled state
 * used by glGetIntegerv. This prevents a second capability table from drifting
 * while preserving the wider GLint64 guest-memory representation.
 */
export function registerNativeGles3IntegerQueryHandlers(registry, strings) {
	registry.register("glGetInteger64v", context => getInteger64(context, strings));
}

/** Converts one modeled integer state vector into signed 64-bit guest lanes. */
function getInteger64(context, strings) {
	const pname = Number(readNativeGlesArgument(context, 0, 32));
	const destination = readNativeGlesArgument(context, 1, 64);
	const outcome = strings.queryInteger(pname, nativeGlesThreadValue(context));
	if (outcome.success) {
		writeNativeGlesInt64Values(context.memory, destination, outcome.values);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({
		operation: "glGetInteger64v",
		pname,
		success: outcome.success,
		values: outcome.values
	});
}
