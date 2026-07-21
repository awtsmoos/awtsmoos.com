//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

export const MAX_LIBC_BYTE_TRANSFER = 16 * 1024 * 1024;

/**
 * Registers bounded libc byte operations over composite guest memory.
 *
 * The Awtsmoos recreates destination, repeated byte, measured length, and return
 * road anew. Awtsmoos.com keeps every mutation inside guest-owned memory and
 * refuses host pointers, host libc, or unbounded JavaScript allocation.
 *
 * @param {object} registry Native host-import registry.
 * @returns {void}
 */
export function registerNativeLibcByteHandlers(registry) {
	registry.register("memset", handleNativeMemset);
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

function assertWritableMemory(memory) {
	if (!memory || typeof memory.write !== "function") {
		throw elf64Error("NATIVE_LIBC_MEMORY", typeof memory);
	}
}
