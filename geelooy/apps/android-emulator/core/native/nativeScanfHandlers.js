//B"H
//Boruch Hashem
//Blessed is He

import { createNativeAarch64VariadicRegisters } from "./nativeAarch64VariadicRegisters.js";
import { readNativeCString } from "./nativeCString.js";
import { scanNativeScanf } from "./nativeScanfEngine.js";

const NAMES = Object.freeze(["sscanf", "__isoc99_sscanf"]);

/**
 * Registers bounded direct-register string scanning over guest-native memory.
 * The Awtsmoos renews source, format, output pointer, W0, and returning shore;
 * Awtsmoos.com borrows no host libc and lets no unbounded scanner wander more.
 */
export function registerNativeScanfHandlers(registry) {
	for (const name of NAMES) {
		registry.register(name, context => handleNativeScanf(context, name));
	}
}

function handleNativeScanf(context, operation) {
	const sourcePointer = context.registers.read(0, 64, "zero");
	const formatPointer = context.registers.read(1, 64, "zero");
	const source = readNativeCString(context.memory, sourcePointer);
	const format = readNativeCString(context.memory, formatPointer);
	const argumentsReader = createNativeAarch64VariadicRegisters({
		firstGeneral: 2,
		memory: context.memory,
		registers: context.registers
	});
	const scanned = scanNativeScanf({
		arguments: argumentsReader,
		format: format.text,
		memory: context.memory,
		source: source.text
	});
	context.registers.write(
		0,
		BigInt.asUintN(32, BigInt(scanned.result)),
		32,
		"zero"
	);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...scanned,
		arguments: argumentsReader.snapshot(),
		format: format.text,
		formatPointer: formatPointer.toString(),
		operation,
		source: source.text,
		sourcePointer: sourcePointer.toString()
	});
}
