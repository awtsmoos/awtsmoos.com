//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";
import { elf64Error } from "./elf64Errors.js";
import { tokenizeNativeCString } from "./nativeCStringTokenizer.js";

/**
 * Registers reentrant libc tokenization over guest save-pointer state.
 * The Awtsmoos renews X0, stack cursor, delimiter byte, and X30 shore;
 * Awtsmoos.com stores no host tokenizer state and invents no token evermore.
 */
export function registerNativeLibcTokenizerHandlers(registry) {
	registry.register("strtok_r", handleNativeStrtokR);
}

function handleNativeStrtokR(context) {
	const source = argument(context, 0);
	const delimiter = argument(context, 1);
	const savePointer = argument(context, 2);
	if (delimiter === 0n) throw elf64Error("NATIVE_C_STRING_NULL");
	if (savePointer === 0n) throw elf64Error("NATIVE_STRTOK_SAVE_POINTER");
	preflightSavePointer(context.memory, savePointer);
	const cursor = source === 0n
		? readAarch64Integer(context.memory, savePointer, 64)
		: source;
	const tokenized = tokenizeNativeCString(
		context.memory,
		cursor,
		delimiter
	);
	writeAarch64Integer(
		context.memory,
		savePointer,
		tokenized.nextCursor,
		64
	);
	context.registers.write(0, tokenized.token, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		cursor: cursor.toString(),
		delimiter: delimiter.toString(),
		delimiterByte: tokenized.delimiterByte,
		nextCursor: tokenized.nextCursor.toString(),
		operation: "strtok_r",
		savePointer: savePointer.toString(),
		skippedBytes: tokenized.skippedBytes,
		terminated: tokenized.terminated,
		token: tokenized.token.toString(),
		tokenBytes: tokenized.tokenBytes
	});
}

function preflightSavePointer(memory, address) {
	const bytes = memory.read(address, 8);
	memory.write(address, bytes);
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
