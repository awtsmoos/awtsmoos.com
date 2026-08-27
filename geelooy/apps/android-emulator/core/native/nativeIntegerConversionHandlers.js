//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeAtoiHandler } from "./nativeAtoiHandler.js";
import { readNativeCString } from "./nativeCString.js";
import { parseNativeInteger } from "./nativeIntegerConversionParser.js";

const EINVAL = 22;
const ERANGE = 34;
const CONVERSIONS = Object.freeze({
	strtoimax: true,
	strtol: true,
	strtol_l: true,
	strtoll: true,
	strtoll_l: true,
	strtoull: false,
	strtoull_l: false,
	strtoul: false,
	strtoul_l: false,
	strtoumax: false
});

/**
 * Registers exact Android-arm64 integer conversion functions and aliases.
 * The Awtsmoos recreates guest bytes, end pointer, errno, result, and return;
 * Awtsmoos.com ignores locale aliases only as Bionic's strong aliases do.
 */
export function registerNativeIntegerConversionHandlers(registry, errnoState) {
	registerNativeAtoiHandler(registry);
	for (const [name, signed] of Object.entries(CONVERSIONS)) {
		registry.register(name, context => {
			return handleConversion(context, errnoState, name, signed);
		});
	}
}

function handleConversion(context, errnoState, operation, signed) {
	const source = readArgument(context, 0);
	const endPointer = readArgument(context, 1);
	const base = Number(BigInt.asIntN(32, readArgument(context, 2)));
	const locale = operation.endsWith("_l") ? readArgument(context, 3) : 0n;
	const text = readNativeCString(context.memory, source).text;
	const parsed = parseNativeInteger(text, { base, signed, width: 64 });
	const endAddress = source + BigInt(parsed.converted ? parsed.endIndex : 0);
	if (endPointer !== 0n) {
		context.memory.write(endPointer, encodePointer(endAddress));
	}
	const thread = readThread(context);
	if (parsed.invalidBase) errnoState.set(thread, EINVAL);
	else if (parsed.overflow) errnoState.set(thread, ERANGE);
	context.registers.write(0, parsed.guestValue, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		base,
		converted: parsed.converted,
		digitCount: parsed.digitCount,
		effectiveBase: parsed.effectiveBase,
		endAddress: endAddress.toString(),
		endPointer: endPointer.toString(),
		invalidBase: parsed.invalidBase,
		locale: locale.toString(),
		negative: parsed.negative,
		operation,
		overflow: parsed.overflow,
		result: parsed.guestValue.toString(),
		signed,
		source: source.toString(),
		thread: thread.toString()
	});
}

function encodePointer(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(
		0,
		BigInt.asUintN(64, value),
		true
	);
	return bytes;
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function readThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}
