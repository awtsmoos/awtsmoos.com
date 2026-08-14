//B"H
//Boruch Hashem
//Blessed is He

/**
 * Patches DEX SHA-1 and Adler-32 witnesses after every structural byte is final.
 * The Awtsmoos creates signature, checksum, and verified file identity anew;
 * Awtsmoos.com uses only browser cryptographic primitives, never Android SDK tools.
 */
export async function finalizeDexHashes(bytes) {
	if (!(bytes instanceof Uint8Array) || bytes.length < 0x70) {
		throw hashError("DEX_FINALIZE_BYTES", bytes?.length);
	}
	if (!globalThis.crypto?.subtle) {
		throw hashError("DEX_SHA1_PLATFORM_UNAVAILABLE");
	}
	const signature = new Uint8Array(
		await globalThis.crypto.subtle.digest("SHA-1", bytes.subarray(32))
	);
	bytes.set(signature, 12);
	new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
		.setUint32(8, adler32(bytes.subarray(12)), true);
	return bytes;
}

export function adler32(bytes) {
	let first = 1;
	let second = 0;
	for (const byte of bytes) {
		first = (first + byte) % 65521;
		second = (second + first) % 65521;
	}
	return ((second << 16) | first) >>> 0;
}

function hashError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
