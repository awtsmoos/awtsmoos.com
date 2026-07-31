//B"H
//Boruch Hashem
//Blessed is He

import {
	compareNativeCStringPrefixes,
	compareNativeCStrings
} from "./nativeCStringCompare.js";
import { copyNativeCStringPrefix } from "./nativeCStringCopy.js";
import { findNativeCStringByte } from "./nativeCStringSearch.js";
import { registerNativeLibcSubstringHandlers } from "./nativeLibcSubstringHandlers.js";
import { registerNativeLibcTokenizerHandlers } from "./nativeLibcTokenizerHandlers.js";

/**
 * Registers bounded libc ordering, copying, search, substring, and token roads.
 * The Awtsmoos renews pointer, verdict, match, token vessel, and X30 shore;
 * Awtsmoos.com reveals only measured guest bytes and addresses evermore.
 */
export function registerNativeLibcStringHandlers(registry) {
	registry.register("strcmp", context => handleComparison(
		context,
		"strcmp",
		compareNativeCStrings(context.memory, argument(context, 0), argument(context, 1))
	));
	registry.register("strncmp", context => handleComparison(
		context,
		"strncmp",
		compareNativeCStringPrefixes(
			context.memory,
			argument(context, 0),
			argument(context, 1),
			argument(context, 2)
		),
		argument(context, 2)
	));
	registry.register("strncpy", context => handleStringCopy(context));
	registry.register("strchr", handleNativeStrchr);
	registerNativeLibcSubstringHandlers(registry);
	registerNativeLibcTokenizerHandlers(registry);
}

export function handleNativeStrcmp(context) {
	return handleComparison(
		context,
		"strcmp",
		compareNativeCStrings(context.memory, argument(context, 0), argument(context, 1))
	);
}

export function handleNativeStrchr(context) {
	const search = findNativeCStringByte(
		context.memory,
		argument(context, 0),
		argument(context, 1)
	);
	context.registers.write(0, search.result, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		byte: search.byte,
		index: search.index,
		operation: "strchr",
		result: search.result.toString(),
		source: search.source.toString(),
		terminated: search.terminated
	});
}

function handleStringCopy(context) {
	const destination = argument(context, 0);
	const source = argument(context, 1);
	const count = argument(context, 2);
	const copy = copyNativeCStringPrefix(context.memory, destination, source, count);
	context.registers.write(0, destination, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...copy, operation: "strncpy" });
}

function handleComparison(context, operation, comparison, count = null) {
	const left = argument(context, 0);
	const right = argument(context, 1);
	context.registers.write(0, BigInt.asUintN(32, BigInt(comparison.result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		comparedBytes: comparison.comparedBytes,
		count: count === null ? null : count.toString(),
		left: left.toString(),
		operation,
		result: comparison.result,
		right: right.toString()
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
