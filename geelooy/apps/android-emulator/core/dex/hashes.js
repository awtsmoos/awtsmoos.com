//B"H
//Boruch Hashem
//Blessed be He

import { dexError } from "./bytes.js";

const ADLER_MODULUS = 65521;
const ADLER_BLOCK_BYTES = 5552;

/**
 * Verifies the DEX Adler-32 checksum and SHA-1 signature promised by its header.
 * Adler-32 is computed entirely in native JavaScript; SHA-1 uses only the browser
 * cryptographic primitive already available to the runtime and never an external
 * package. Every digest is compared against the immutable bytes before acceptance.
 *
 * @param {object} view Validated DEX byte view.
 * @returns {Promise<object>} Immutable verification testimony.
 */
export async function verifyDexHashes(view) {
	const expectedChecksum = view.u32(8, "DEX expected checksum");
	const actualChecksum = adler32(view.bytes.subarray(12));
	if (actualChecksum !== expectedChecksum) {
		throw dexError(
			"DEX_CHECKSUM_MISMATCH",
			`${actualChecksum}:${expectedChecksum}`
		);
	}
	if (!globalThis.crypto?.subtle) {
		throw dexError("DEX_SHA1_PLATFORM_UNAVAILABLE");
	}
	const digest = new Uint8Array(
		await globalThis.crypto.subtle.digest("SHA-1", view.bytes.subarray(32))
	);
	const expected = view.range(12, 20, "DEX expected signature");
	if (!equalBytes(digest, expected)) {
		throw dexError(
			"DEX_SIGNATURE_MISMATCH",
			`${hex(digest)}:${hex(expected)}`
		);
	}
	return Object.freeze({
		checksum: actualChecksum,
		signature: hex(digest),
		verified: true
	});
}

/**
 * Computes RFC-compatible Adler-32 with bounded accumulation blocks.
 * Reducing modulo only after at most 5,552 bytes is mathematically identical to
 * reducing after every byte, while avoiding millions of expensive `%` operations
 * on large DEX files. The bound keeps both accumulators exactly representable.
 *
 * @param {Uint8Array} bytes Bytes covered by the Adler-32 checksum.
 * @returns {number} Unsigned 32-bit Adler-32 value.
 */
export function adler32(bytes) {
	let first = 1;
	let second = 0;
	let index = 0;
	while (index < bytes.length) {
		const end = Math.min(index + ADLER_BLOCK_BYTES, bytes.length);
		for (; index < end; index += 1) {
			first += bytes[index];
			second += first;
		}
		first %= ADLER_MODULUS;
		second %= ADLER_MODULUS;
	}
	return ((second << 16) | first) >>> 0;
}

/** Compares two byte sequences without an early content-dependent exit. */
function equalBytes(left, right) {
	if (left.length !== right.length) return false;
	let difference = 0;
	for (let index = 0; index < left.length; index += 1) {
		difference |= left[index] ^ right[index];
	}
	return difference === 0;
}

/** Encodes bytes as lowercase hexadecimal for bounded diagnostic evidence. */
function hex(bytes) {
	return [...bytes]
		.map(byte => byte.toString(16).padStart(2, "0"))
		.join("");
}
