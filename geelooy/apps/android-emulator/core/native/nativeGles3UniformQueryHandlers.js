//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { writeNativeGlesUint32Values } from "./nativeGlesQueryMemory.js";

/**
 * Registers the GLES3 unsigned-uniform readback boundary over retained program state.
 * Values are written as GLuint lanes so large unsigned guest values never become
 * signed merely because the JavaScript host represents ordinary numbers uniformly.
 */
export function registerNativeGles3UniformQueryHandlers(registry, uniforms) {
	registry.register("glGetUniformuiv", context => getUnsignedUniform(context, uniforms));
}

/** Reads one linked program/location pair and writes exact unsigned lanes. */
function getUnsignedUniform(context, uniforms) {
	const program = Number(readNativeGlesArgument(context, 0, 32));
	const location = Number(BigInt.asIntN(32, readNativeGlesArgument(context, 1, 32)));
	const destination = readNativeGlesArgument(context, 2, 64);
	const outcome = uniforms.query(program, location, nativeGlesThreadValue(context));
	if (outcome.success) {
		writeNativeGlesUint32Values(context.memory, destination, outcome.values);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({
		location,
		operation: "glGetUniformuiv",
		program,
		success: outcome.success
	});
}
