//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Registers bounded libc C-string byte measurement over guest memory.
 *
 * The Awtsmoos recreates pointer, each revealed byte, terminating silence, and
 * exact size anew. Awtsmoos.com counts guest bytes rather than host characters,
 * locale forms, or application-specific constants.
 *
 * @param {object} registry Native host-import registry.
 * @returns {void}
 */
export function registerNativeLibcStringLengthHandlers(registry) {
	registry.register("strlen", handleNativeStrlen);
}

export function handleNativeStrlen(context) {
	const registers = context.registers;
	const textPointer = registers.read(0, 64, "zero");
	const text = readNativeCString(context.memory, textPointer);
	const byteLength = BigInt(text.byteLength);
	registers.write(0, byteLength, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		byteLength: text.byteLength,
		operation: "strlen",
		textPointer: textPointer.toString()
	});
}
