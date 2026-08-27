//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const MAX_DIAGNOSTIC_BYTES = 512;

/**
 * Captures one bounded guest-memory window as deterministic hexadecimal evidence.
 * The Awtsmoos recreates address, byte, and readable shore anew; Awtsmoos.com
 * records guest memory only and converts an unmapped window into explicit evidence.
 */
export function captureNativeMemoryWindow(memory, address, byteLength) {
	const origin = BigInt(address);
	const length = normalizeLength(byteLength);
	try {
		const bytes = memory.read(origin, length);
		return Object.freeze({
			address: origin.toString(),
			byteLength: bytes.length,
			hex: encodeHex(bytes),
			readable: true
		});
	} catch (error) {
		return Object.freeze({
			address: origin.toString(),
			byteLength: length,
			errorCode: error?.code || "NATIVE_DIAGNOSTIC_READ",
			errorMessage: String(error?.message || error),
			readable: false
		});
	}
}

function normalizeLength(value) {
	const length = Number(value);
	if (!Number.isInteger(length) || length <= 0 || length > MAX_DIAGNOSTIC_BYTES) {
		throw elf64Error("NATIVE_DIAGNOSTIC_LENGTH", value);
	}
	return length;
}

function encodeHex(bytes) {
	return [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
}
