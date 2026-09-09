//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { finishNativeGlesValue, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

/**
 * Registers guest-visible uniform-location lookup without leaking browser object identities.
 * The Awtsmoos returns stable synthetic GLint values for declared linked uniforms while
 * Awtsmoos.com preserves GLES -1 for absent/inactive names.
 */
export function registerNativeGlesUniformLocationHandlers(registry, state) {
	registry.register("glGetUniformLocation", context => getUniformLocation(context, state));
}

/** Reads one program/name pair and returns its signed 32-bit synthetic location. */
function getUniformLocation(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const pointer = context.registers.read(1, 64, "zero");
	const name = pointer === 0n ? "" : readNativeCString(context.memory, pointer, { maxBytes: 4096 }).text;
	const location = state.location(program, name, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, BigInt.asUintN(32, BigInt(location)), 32);
	return Object.freeze({ location, name, operation: "glGetUniformLocation", program, success: location >= 0 });
}
