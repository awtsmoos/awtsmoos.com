//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import {
	writeNativeGlesFloat32Values,
	writeNativeGlesInt32Values
} from "./nativeGlesQueryMemory.js";

/** Registers GLES2 uniform-value queries over retained linked-program state. */
export function registerNativeGles2UniformQueryHandlers(registry, uniforms) {
	registry.register(
		"glGetUniformfv",
		context => getUniform(context, uniforms, true)
	);
	registry.register(
		"glGetUniformiv",
		context => getUniform(context, uniforms, false)
	);
}

/** Reads one program/location pair and writes its current typed values. */
function getUniform(context, uniforms, floating) {
	const program = Number(readNativeGlesArgument(context, 0, 32));
	const location = Number(BigInt.asIntN(32, readNativeGlesArgument(context, 1, 32)));
	const destination = readNativeGlesArgument(context, 2, 64);
	const outcome = uniforms.query(program, location, nativeGlesThreadValue(context));
	if (outcome.success) {
		const writer = floating
			? writeNativeGlesFloat32Values
			: writeNativeGlesInt32Values;
		writer(context.memory, destination, outcome.values);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({
		location,
		operation: floating ? "glGetUniformfv" : "glGetUniformiv",
		program,
		success: outcome.success
	});
}
