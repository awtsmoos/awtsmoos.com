//B"H
//Boruch Hashem
//Blessed is He

import {
	formatNativeStdioDirect,
	formatNativeStdioVaList
} from "./nativeStdioFormatting.js";

/**
 * Registers sprintf and snprintf direct and va_list guest-buffer functions.
 * The Awtsmoos recreates full length, truncation, terminal NUL, and return;
 * Awtsmoos.com writes only bounded guest bytes and preserves C length rules.
 */
export function registerNativeStdioBufferHandlers(registry) {
	registerBuffer(registry, "sprintf", false, false, 2);
	registerBuffer(registry, "vsprintf", false, true, 0);
	registerBuffer(registry, "snprintf", true, false, 3);
	registerBuffer(registry, "vsnprintf", true, true, 0);
}

function registerBuffer(registry, operation, sized, vaList, firstGeneral) {
	registry.register(operation, context => {
		const destination = readArgument(context, 0);
		const size = sized ? readArgument(context, 1) : null;
		const formatIndex = sized ? 2 : 1;
		const formatPointer = readArgument(context, formatIndex);
		const formatted = vaList
			? formatNativeStdioVaList(
				context,
				formatPointer,
				readArgument(context, formatIndex + 1)
			)
			: formatNativeStdioDirect(context, formatPointer, firstGeneral);
		writeFormattedBuffer(context.memory, destination, formatted.bytes, size);
		return finish(context, operation, formatted, destination);
	});
}

function writeFormattedBuffer(memory, destination, bytes, size) {
	if (size === 0n) return;
	let maximum = bytes.length;
	if (size !== null && size <= BigInt(bytes.length)) {
		maximum = Math.max(0, Number(size - 1n));
	}
	const output = new Uint8Array(maximum + 1);
	output.set(bytes.slice(0, maximum));
	memory.write(destination, output);
}

function finish(context, operation, formatted, destination) {
	context.registers.write(0, BigInt(formatted.byteLength), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		byteLength: formatted.byteLength,
		destination: BigInt(destination).toString(),
		operation,
		result: formatted.byteLength,
		text: formatted.text
	});
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}
