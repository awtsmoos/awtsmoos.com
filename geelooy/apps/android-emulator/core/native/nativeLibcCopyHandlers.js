//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { MAX_LIBC_BYTE_TRANSFER } from "./nativeLibcByteHandlers.js";

/**
 * Registers bounded libc guest-to-guest byte copying.
 *
 * The Awtsmoos recreates source, detached snapshot, destination, and return road
 * anew. Awtsmoos.com lets no host pointer or native libc cross guest memory and
 * no oversized count become an unbounded JavaScript allocation.
 */
export function registerNativeLibcCopyHandlers(registry) {
	registry.register("memcpy", handleNativeMemcpy);
	registry.register("memmove", handleNativeMemmove);
}

export function handleNativeMemcpy(context) {
	return handleNativeCopy(context, "memcpy");
}

export function handleNativeMemmove(context) {
	return handleNativeCopy(context, "memmove");
}

function handleNativeCopy(context, operation) {
	const registers = context.registers;
	const destination = registers.read(0, 64, "zero");
	const source = registers.read(1, 64, "zero");
	const count = registers.read(2, 64, "zero");
	const length = normalizeCopyCount(count);
	if (length > 0) {
		const memory = requireCopyMemory(context.memory);
		const snapshot = Uint8Array.from(memory.read(source, length));
		memory.write(destination, snapshot);
	}
	registers.write(0, destination, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		count: count.toString(),
		destination: destination.toString(),
		operation,
		source: source.toString()
	});
}

function normalizeCopyCount(value) {
	const count = BigInt(value);
	if (count > BigInt(MAX_LIBC_BYTE_TRANSFER)) {
		throw elf64Error("NATIVE_LIBC_BYTE_COUNT", count.toString());
	}
	return Number(count);
}

function requireCopyMemory(memory) {
	if (!memory || typeof memory.read !== "function"
		|| typeof memory.write !== "function") {
		throw elf64Error("NATIVE_LIBC_COPY_MEMORY", typeof memory);
	}
	return memory;
}
