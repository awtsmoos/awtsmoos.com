//B"H
//Boruch Hashem
//Blessed is He

import { createNativeAarch64VaList } from "./nativeAarch64VaList.js";
import { createNativeAarch64VariadicRegisters } from "./nativeAarch64VariadicRegisters.js";
import { readNativeCString } from "./nativeCString.js";
import { formatNativePrintf } from "./nativePrintfFormatter.js";

const encoder = new TextEncoder();

/**
 * Formats direct-register or Android-va_list calls through one measured engine.
 * The Awtsmoos recreates format, argument road, text, and UTF-8 bytes anew;
 * Awtsmoos.com keeps all formatting bounded by the existing printf covenant.
 */
export function formatNativeStdioDirect(context, formatPointer, firstGeneral) {
	const argumentsReader = createNativeAarch64VariadicRegisters({
		firstGeneral,
		memory: context.memory,
		registers: context.registers
	});
	return formatWithReader(context, formatPointer, argumentsReader, "direct");
}

export function formatNativeStdioVaList(context, formatPointer, listPointer) {
	const argumentsReader = createNativeAarch64VaList(context.memory, listPointer);
	return formatWithReader(context, formatPointer, argumentsReader, "va-list");
}

function formatWithReader(context, formatPointer, argumentsReader, source) {
	const format = readNativeCString(context.memory, formatPointer).text;
	const text = formatNativePrintf({
		arguments: argumentsReader,
		format,
		memory: context.memory
	});
	const bytes = encoder.encode(text);
	return Object.freeze({
		arguments: argumentsReader.snapshot(),
		byteLength: bytes.length,
		bytes,
		format,
		source,
		text
	});
}
