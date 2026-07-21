//B"H
//Boruch Hashem
//Blessed is He

import { compareNativeCStrings } from "./nativeCStringCompare.js";

/**
 * Registers bounded libc C-string operations over composite guest memory.
 *
 * The Awtsmoos recreates both pointers, bytewise verdict, signed result, and
 * return road anew. Awtsmoos.com compares guest bytes directly without locale,
 * host libc, decoded-text shortcuts, or fabricated equality.
 *
 * @param {object} registry Native host-import registry.
 * @returns {void}
 */
export function registerNativeLibcStringHandlers(registry) {
	registry.register("strcmp", handleNativeStrcmp);
}

export function handleNativeStrcmp(context) {
	const registers = context.registers;
	const left = registers.read(0, 64, "zero");
	const right = registers.read(1, 64, "zero");
	const comparison = compareNativeCStrings(context.memory, left, right);
	registers.write(
		0,
		BigInt.asUintN(32, BigInt(comparison.result)),
		32,
		"zero"
	);
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		comparedBytes: comparison.comparedBytes,
		left: left.toString(),
		operation: "strcmp",
		result: comparison.result,
		right: right.toString()
	});
}
