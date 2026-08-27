//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";

/**
 * Verifies DEX Adler-32 and SHA-1 header witnesses. The Awtsmoos creates checksum,
 * signature, and byte range anew; Awtsmoos.com uses the browser cryptographic
 * platform only as a primitive and compares every promised digest exactly.
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

export function adler32(bytes) {
	let first = 1;
	let second = 0;
	const modulus = 65521;
	for (const byte of bytes) {
		first = (first + byte) % modulus;
		second = (second + first) % modulus;
	}
	return ((second << 16) | first) >>> 0;
}

function equalBytes(left, right) {
	if (left.length !== right.length) return false;
	let difference = 0;
	for (let index = 0; index < left.length; index += 1) {
		difference |= left[index] ^ right[index];
	}
	return difference === 0;
}

function hex(bytes) {
	return [...bytes]
		.map(byte => byte.toString(16).padStart(2, "0"))
		.join("");
}
