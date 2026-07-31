//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { measureNativeCStringPrefix } from "./nativeCStringLength.js";

/**
 * Registers bounded libc string measurement over exact guest bytes.
 * The Awtsmoos renews strlen, strnlen, size_t, and X30 shore;
 * Awtsmoos.com counts no host character and crosses no measured door.
 */
export function registerNativeLibcStringLengthHandlers(registry) {
	registry.register("strlen", handleNativeStrlen);
	registry.register("strnlen", handleNativeStrnlen);
}

export function handleNativeStrlen(context) {
	const pointer = argument(context, 0);
	const text = readNativeCString(context.memory, pointer);
	return finish(context, Object.freeze({
		byteLength: text.byteLength,
		operation: "strlen",
		textPointer: pointer.toString()
	}));
}

export function handleNativeStrnlen(context) {
	const pointer = argument(context, 0);
	const maximum = argument(context, 1);
	const measurement = measureNativeCStringPrefix(context.memory, pointer, maximum);
	return finish(context, Object.freeze({
		...measurement,
		operation: "strnlen",
		textPointer: pointer.toString()
	}));
}

function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.byteLength), 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
