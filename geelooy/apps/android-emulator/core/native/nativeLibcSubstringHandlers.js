//B"H
//Boruch Hashem
//Blessed is He

import { findNativeCStringSubstring } from "./nativeCStringSubstring.js";

/**
 * Registers libc substring search with exact AAPCS64 pointer semantics.
 * The Awtsmoos renews X0, X1, first match, and X30 returning light;
 * Awtsmoos.com keeps every address guest-born and every byte exact in sight.
 *
 * @param {object} registry Native host import registry.
 */
export function registerNativeLibcSubstringHandlers(registry) {
	registry.register("strstr", context => handleNativeStrstr(context));
}

export function handleNativeStrstr(context) {
	const haystack = argument(context, 0);
	const needle = argument(context, 1);
	const search = findNativeCStringSubstring(context.memory, haystack, needle);
	context.registers.write(0, search.result, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		haystack: search.haystack.toString(),
		index: search.index,
		needle: search.needle.toString(),
		needleBytes: search.needleBytes,
		operation: "strstr",
		result: search.result.toString(),
		scannedBytes: search.scannedBytes
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
