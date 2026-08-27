//B"H
//Boruch Hashem
//Blessed is He

import {
	formatNativeStdioDirect,
	formatNativeStdioVaList
} from "./nativeStdioFormatting.js";

const ENOMEM = 12;

/**
 * Registers asprintf and vasprintf guest-heap allocation functions.
 * The Awtsmoos recreates allocation, text bytes, pointer store, errno, return;
 * Awtsmoos.com never returns a host allocation or host-owned string pointer.
 */
export function registerNativeStdioAllocationHandlers(registry, options) {
	registerAllocation(registry, "asprintf", false, options);
	registerAllocation(registry, "vasprintf", true, options);
}

function registerAllocation(registry, operation, vaList, options) {
	registry.register(operation, context => {
		const destinationPointer = readArgument(context, 0);
		const formatPointer = readArgument(context, 1);
		const formatted = vaList
			? formatNativeStdioVaList(
				context,
				formatPointer,
				readArgument(context, 2)
			)
			: formatNativeStdioDirect(context, formatPointer, 2);
		const allocation = options.heap.allocate(BigInt(formatted.byteLength + 1));
		if (allocation === 0n) {
			context.memory.write(destinationPointer, encodePointer(0n));
			options.errnoState.set(readThread(context), ENOMEM);
			return finishFailure(context, operation, destinationPointer);
		}
		const output = new Uint8Array(formatted.byteLength + 1);
		output.set(formatted.bytes);
		context.memory.write(allocation, output);
		context.memory.write(destinationPointer, encodePointer(allocation));
		return finishSuccess(context, operation, formatted, allocation);
	});
}

function finishSuccess(context, operation, formatted, allocation) {
	context.registers.write(0, BigInt(formatted.byteLength), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		allocation: allocation.toString(),
		byteLength: formatted.byteLength,
		operation,
		result: formatted.byteLength,
		text: formatted.text
	});
}

function finishFailure(context, operation, destination) {
	context.registers.write(0, 0xffffffffn, 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		destination: BigInt(destination).toString(),
		operation,
		result: -1
	});
}

function encodePointer(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
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
