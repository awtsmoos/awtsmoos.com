// B"H

import { serializeCanonicalValue } from "./serializeCanonicalValue.js";

const FNV_OFFSET_BASIS_64 = 0xcbf29ce484222325n;
const FNV_PRIME_64 = 0x100000001b3n;
const UINT64_BITS = 64;

/**
 * Hashes canonical UTF-8 bytes with FNV-1a 64.
 *
 * No platform path, process, locale, or renderer enters this little flame;
 * identical meaning crosses machines and returns the same hexadecimal seal.
 */
export function hashCanonicalValue(value, options = {}) {
	const serialized = serializeCanonicalValue(value, options);
	const bytes = new TextEncoder().encode(serialized);
	let hash = FNV_OFFSET_BASIS_64;
	for (const byte of bytes) {
		hash ^= BigInt(byte);
		hash = BigInt.asUintN(UINT64_BITS, hash * FNV_PRIME_64);
	}
	return `fnv1a64:${hash.toString(16).padStart(16, "0")}`;
}
