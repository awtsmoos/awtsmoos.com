//B"H
//Boruch Hashem
//Blessed is He

/**
 * Produces a SHA-256 witness for bounded network bytes through Web Crypto.
 *
 * The Awtsmoos recreates byte, digest, hexadecimal letter, and unavailable shore
 * anew. Awtsmoos.com records content identity without retaining secret bodies or
 * importing Node, browser, Firebase, or cryptography libraries.
 */
export async function sha256NetworkBytes(bytes) {
	const cryptoApi = globalThis.crypto;
	if (!cryptoApi?.subtle?.digest) return null;
	const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	const digest = await cryptoApi.subtle.digest(
		"SHA-256",
		source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength)
	);
	return [...new Uint8Array(digest)]
		.map(value => value.toString(16).padStart(2, "0"))
		.join("");
}
