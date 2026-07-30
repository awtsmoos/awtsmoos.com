//B"H
//Boruch Hashem
//Blessed is He

import {
	compareNativeCStringPrefixes,
	compareNativeCStrings
} from "./nativeCStringCompare.js";
import { copyNativeCStringPrefix } from "./nativeCStringCopy.js";

/**
 * Registers bounded libc C-string ordering and copying over guest memory.
 * The Awtsmoos renews pointer, count, verdict, copied vessel, and X30 shore;
 * Awtsmoos.com compares and copies raw bytes without host libc evermore.
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
}

export function handleNativeStrcmp(context) {
	return handleComparison(
		context,
		"strcmp",
		compareNativeCStrings(context.memory, argument(context, 0), argument(context, 1))
	);
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
	context.registers.write(
		0,
		BigInt.asUintN(32, BigInt(comparison.result)),
		32,
		"zero"
	);
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
