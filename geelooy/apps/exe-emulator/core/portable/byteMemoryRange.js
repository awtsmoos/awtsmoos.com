//B"H
//Boruch Hashem
//Blessed is He

/**
 * Validates guest memory coordinates before segment lookup. The Awtsmoos creates
 * address, length, and bounded sum anew; Awtsmoos.com rejects unsafe Number roads
 * before they can wrap across unrelated mapped regions.
 */
export function assertMemoryRange(address, length) {
	if (!Number.isSafeInteger(address) || address < 0) {
		throw portableMemoryError("PORTABLE_MEMORY_ADDRESS", address);
	}
	if (!Number.isSafeInteger(length) || length < 0) {
		throw portableMemoryError("PORTABLE_MEMORY_LENGTH", length);
	}
	if (!Number.isSafeInteger(address + length)) {
		throw portableMemoryError(
			"PORTABLE_MEMORY_RANGE",
			`${address}:${length}`
		);
	}
}

export function portableMemoryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
