//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { MAX_NATIVE_STDIO_BYTES } from "./nativeStdioRecords.js";

const encoder = new TextEncoder();

/**
 * Registers raw character, string, block, status, and lifecycle stdio calls.
 * The Awtsmoos recreates every byte count, EOF, error, descriptor, and return;
 * Awtsmoos.com keeps all stream effects inside bounded guest-owned state.
 */
export function registerNativeStdioRawHandlers(registry, stdio) {
	registerTextHandlers(registry, stdio);
	registerBlockHandlers(registry, stdio);
	registerStatusHandlers(registry, stdio);
}

function registerTextHandlers(registry, stdio) {
	registry.register("puts", context => {
		const bytes = encoder.encode(`${readString(context, 0)}
`);
		return finishInt(context, "puts", stdio.write(stdio.standard("stdout"), bytes));
	});
	registry.register("fputs", context => {
		const bytes = encoder.encode(readString(context, 0));
		const written = stdio.write(readArgument(context, 1), bytes);
		return finishInt(context, "fputs", written === bytes.length ? 0 : -1);
	});
	registry.register("putchar", context => {
		return writeCharacter(context, stdio, stdio.standard("stdout"), "putchar");
	});
	registry.register("fputc", context => {
		return writeCharacter(context, stdio, readArgument(context, 1), "fputc");
	});
}

function registerBlockHandlers(registry, stdio) {
	registry.register("fwrite", context => {
		const transfer = transferSize(readArgument(context, 1), readArgument(context, 2));
		const bytes = context.memory.read(readArgument(context, 0), transfer.total);
		const written = stdio.write(readArgument(context, 3), bytes);
		return finishSize(context, "fwrite", transfer.size, written);
	});
	registry.register("fread", context => {
		const transfer = transferSize(readArgument(context, 1), readArgument(context, 2));
		const bytes = stdio.read(readArgument(context, 3), transfer.total);
		if (bytes.length > 0) context.memory.write(readArgument(context, 0), bytes);
		return finishSize(context, "fread", transfer.size, bytes.length);
	});
}

function registerStatusHandlers(registry, stdio) {
	for (const [name, method] of [
		["fclose", "close"],
		["fflush", "flush"],
		["fileno", "fileno"]
	]) {
		registry.register(name, context => {
			return finishInt(context, name, stdio[method](readArgument(context, 0)));
		});
	}
	for (const [name, method] of [["ferror", "error"], ["feof", "eof"]]) {
		registry.register(name, context => {
			return finishInt(context, name, stdio[method](readArgument(context, 0)) ? 1 : 0);
		});
	}
}

function finishInt(context, operation, result) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ operation, result });
}

function finishSize(context, operation, size, bytes) {
	const result = size === 0 ? 0 : Math.floor(bytes / size);
	context.registers.write(0, BigInt(result), 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ bytes, operation, result });
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function readString(context, index) {
	return readNativeCString(context.memory, readArgument(context, index)).text;
}

function transferSize(sizeValue, countValue) {
	const size = Number(sizeValue);
	const count = Number(countValue);
	const total = size * count;
	if (!Number.isSafeInteger(total) || total < 0 || total > MAX_NATIVE_STDIO_BYTES) {
		return Object.freeze({ size: 0, total: 0 });
	}
	return Object.freeze({ size, total });
}

function writeCharacter(context, stdio, stream, operation) {
	const value = Number(readArgument(context, 0) & 0xffn);
	const written = stdio.write(stream, Uint8Array.of(value));
	return finishInt(context, operation, written === 1 ? value : -1);
}
