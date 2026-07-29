//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { handleNativeMemcmp } from "./nativeLibcMemoryCompare.js";

export const MAX_LIBC_BYTE_TRANSFER = 16 * 1024 * 1024;

/**
 * Registers bounded libc byte operations over composite guest memory.
 * The Awtsmoos recreates address, byte, measured length, and return road anew;
 * Awtsmoos.com refuses host pointers, host libc, and unbounded allocation.
 */
export function registerNativeLibcByteHandlers(registry) {
	registry.register("memcmp", context => {
		return handleNativeMemcmp(context, MAX_LIBC_BYTE_TRANSFER);
	});
	registry.register("memchr", handleNativeMemchr);
	registry.register("memset", handleNativeMemset);
}

export function handleNativeMemchr(context) {
	const registers = context.registers;
	const source = registers.read(0, 64, "zero");
	const rawValue = registers.read(1, 32, "zero");
	const count = registers.read(2, 64, "zero");
	const length = normalizeByteCount(count);
	const byte = Number(rawValue & 0xffn);
	let index = -1;
	let result = 0n;
	if (length > 0) {
		const memory = requireReadableMemory(context.memory);
		const bytes = Uint8Array.from(memory.read(source, length));
		index = bytes.indexOf(byte);
		if (index >= 0) result = source + BigInt(index);
	}
	registers.write(0, result, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		byte,
		count: count.toString(),
		index,
		operation: "memchr",
		result: result.toString(),
		source: source.toString()
	});
}

export function handleNativeMemset(context) {
	const registers = context.registers;
	const destination = registers.read(0, 64, "zero");
	const rawValue = registers.read(1, 32, "zero");
	const count = registers.read(2, 64, "zero");
	const length = normalizeByteCount(count);
	const byte = Number(rawValue & 0xffn);
	if (length > 0) {
		assertWritableMemory(context.memory);
		const bytes = new Uint8Array(length);
		bytes.fill(byte);
		context.memory.write(destination, bytes);
	}
	registers.write(0, destination, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		byte,
		count: count.toString(),
		destination: destination.toString(),
		operation: "memset"
	});
}

function normalizeByteCount(value) {
	const count = BigInt(value);
	if (count > BigInt(MAX_LIBC_BYTE_TRANSFER)) {
		throw elf64Error("NATIVE_LIBC_BYTE_COUNT", count.toString());
	}
	return Number(count);
}

function requireReadableMemory(memory) {
	if (!memory || typeof memory.read !== "function") {
		throw elf64Error("NATIVE_LIBC_READ_MEMORY", typeof memory);
	}
	return memory;
}

function assertWritableMemory(memory) {
	if (!memory || typeof memory.write !== "function") {
		throw elf64Error("NATIVE_LIBC_MEMORY", typeof memory);
	}
}
