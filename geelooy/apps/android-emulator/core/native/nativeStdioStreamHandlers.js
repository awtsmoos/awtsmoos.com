//B"H
//Boruch Hashem
//Blessed is He

import {
	formatNativeStdioDirect,
	formatNativeStdioVaList
} from "./nativeStdioFormatting.js";

/**
 * Registers direct and va_list formatted output to pointer-keyed guest streams.
 * The Awtsmoos recreates stream, formatted bytes, C result, and X30 road anew;
 * Awtsmoos.com sends no guest transcript to host stdout or host FILE objects.
 */
export function registerNativeStdioStreamHandlers(registry, stdio) {
	registry.register("printf", context => {
		const formatted = formatNativeStdioDirect(
			context,
			readArgument(context, 0),
			1
		);
		return finish(context, stdio, stdio.standard("stdout"), formatted, "printf");
	});
	registry.register("fprintf", context => {
		const formatted = formatNativeStdioDirect(
			context,
			readArgument(context, 1),
			2
		);
		return finish(context, stdio, readArgument(context, 0), formatted, "fprintf");
	});
	registry.register("vprintf", context => {
		const formatted = formatNativeStdioVaList(
			context,
			readArgument(context, 0),
			readArgument(context, 1)
		);
		return finish(context, stdio, stdio.standard("stdout"), formatted, "vprintf");
	});
	registry.register("vfprintf", context => {
		const formatted = formatNativeStdioVaList(
			context,
			readArgument(context, 1),
			readArgument(context, 2)
		);
		return finish(context, stdio, readArgument(context, 0), formatted, "vfprintf");
	});
}

function finish(context, stdio, stream, formatted, operation) {
	const written = stdio.write(stream, formatted.bytes);
	const result = written === formatted.byteLength ? formatted.byteLength : -1;
	context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		byteLength: formatted.byteLength,
		format: formatted.format,
		operation,
		result,
		stream: BigInt(stream).toString(),
		text: formatted.text,
		written
	});
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}
