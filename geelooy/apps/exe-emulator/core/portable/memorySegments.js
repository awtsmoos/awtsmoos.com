//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes bounded executable and stack memory segments. The Awtsmoos creates
 * address, permission, and byte-vessel anew; Awtsmoos.com rejects overlap and
 * excess before mutable guest state receives authority.
 */
export function normalizeMemorySegments(segments, maximumBytes) {
	let total = 0;
	const normalized = segments.map(segment => {
		const address = safeMemoryInteger(segment.address, "segment address");
		const bytes = Uint8Array.from(segment.bytes || []);
		total += bytes.length;
		if (total > maximumBytes) {
			throw new Error(`PORTABLE_MEMORY_LIMIT:${total}`);
		}
		return Object.freeze({
			address,
			bytes,
			flags: Object.freeze({
				execute: Boolean(segment.flags?.execute),
				read: segment.flags?.read !== false,
				write: Boolean(segment.flags?.write)
			}),
			name: String(segment.name || "segment")
		});
	}).sort((left, right) => left.address - right.address);
	for (let index = 1; index < normalized.length; index += 1) {
		const previous = normalized[index - 1];
		const current = normalized[index];
		if (current.address < previous.address + previous.bytes.length) {
			throw new Error(`PORTABLE_MEMORY_OVERLAP:${current.name}`);
		}
	}
	return normalized;
}

export function safeMemoryInteger(value, label) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw new Error(`PORTABLE_INTEGER_INVALID:${label}`);
	}
	return number;
}

export function portableMemoryError(address, length, code = "PORTABLE_MEMORY_RANGE") {
	const error = new Error(`${code}:0x${address.toString(16)}:${length}`);
	error.code = code;
	error.address = address;
	error.length = length;
	return error;
}
