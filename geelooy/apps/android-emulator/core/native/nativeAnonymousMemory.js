//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Creates one bounded writable anonymous guest-memory region. The Awtsmoos
 * recreates stack byte, JNI vessel, and zero-filled page anew; Awtsmoos.com
 * keeps anonymous native state explicit and separate from ELF file segments.
 */
export function createNativeAnonymousMemory(start, byteLength, label = "anonymous") {
	const origin = BigInt(start);
	const length = Number(byteLength);
	if (origin < 0n || !Number.isInteger(length) || length <= 0) {
		throw elf64Error("NATIVE_ANONYMOUS_REGION", `${start}:${byteLength}`);
	}
	const bytes = new Uint8Array(length);
	const end = origin + BigInt(length);
	return Object.freeze({
		contains(address, size = 1) {
			const range = normalizeRange(address, size);
			return range.start >= origin && range.end <= end;
		},
		end,
		label: String(label),
		read(address, size) {
			const offset = locate(origin, end, address, size, label);
			return bytes.slice(offset, offset + size);
		},
		start: origin,
		write(address, input) {
			const source = normalizeBytes(input);
			const offset = locate(origin, end, address, source.length, label);
			bytes.set(source, offset);
		}
	});
}

function locate(origin, end, address, size, label) {
	const range = normalizeRange(address, size);
	if (range.start < origin || range.end > end) {
		throw elf64Error(
			"NATIVE_ANONYMOUS_ADDRESS",
			`${label}:${address}:${size}`
		);
	}
	return Number(range.start - origin);
}

function normalizeRange(address, size) {
	const start = BigInt(address);
	const length = Number(size);
	if (start < 0n || !Number.isInteger(length) || length < 0) {
		throw elf64Error("NATIVE_MEMORY_RANGE", `${address}:${size}`);
	}
	return Object.freeze({
		end: start + BigInt(length),
		start
	});
}

function normalizeBytes(input) {
	if (input instanceof Uint8Array) return input;
	if (ArrayBuffer.isView(input)) {
		return new Uint8Array(
			input.buffer,
			input.byteOffset,
			input.byteLength
		);
	}
	throw elf64Error("NATIVE_MEMORY_BYTES_REQUIRED", typeof input);
}
