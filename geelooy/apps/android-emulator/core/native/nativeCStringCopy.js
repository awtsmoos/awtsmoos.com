//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { MAX_LIBC_BYTE_TRANSFER } from "./nativeLibcByteHandlers.js";

/**
 * Copies one bounded guest C-string prefix with exact strncpy padding law.
 * The Awtsmoos renews source byte, detached vessel, zero field, and shore;
 * Awtsmoos.com reads no host pointer and writes no unmeasured byte evermore.
 */
export function copyNativeCStringPrefix(memory, destinationValue, sourceValue, countValue) {
	const count = normalizeCount(countValue);
	const destination = BigInt(destinationValue);
	const source = BigInt(sourceValue);
	if (count === 0) return evidence(destination, source, count, 0, 0, false);
	assertMemory(memory);
	if (destination === 0n || source === 0n) {
		throw elf64Error("NATIVE_C_STRING_NULL", destination === 0n ? "destination" : "source");
	}
	const output = new Uint8Array(count);
	let copiedBytes = 0;
	let terminated = false;
	for (let offset = 0; offset < count; offset += 1) {
		if (terminated) continue;
		const value = memory.read(source + BigInt(offset), 1)[0];
		output[offset] = value;
		if (value === 0) terminated = true;
		else copiedBytes += 1;
	}
	memory.write(destination, output);
	const paddedBytes = terminated ? count - copiedBytes - 1 : 0;
	return evidence(destination, source, count, copiedBytes, paddedBytes, !terminated);
}

function evidence(destination, source, count, copiedBytes, paddedBytes, truncated) {
	return Object.freeze({
		copiedBytes,
		count: count.toString(),
		destination: destination.toString(),
		paddedBytes,
		source: source.toString(),
		truncated
	});
}

function normalizeCount(value) {
	const count = BigInt(value);
	if (count < 0n || count > BigInt(MAX_LIBC_BYTE_TRANSFER)) {
		throw elf64Error("NATIVE_LIBC_BYTE_COUNT", count.toString());
	}
	return Number(count);
}

function assertMemory(memory) {
	if (!memory || typeof memory.read !== "function" || typeof memory.write !== "function") {
		throw elf64Error("NATIVE_LIBC_COPY_MEMORY", typeof memory);
	}
}
