//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes bounded executable and stack memory segments. The Awtsmoos creates
 * address, permission, shared read-only view, and owned writable vessel anew;
 * Awtsmoos.com rejects overlap and excess before guest state receives authority.
 */
export function normalizeMemorySegments(segments, maximumBytes) {
	let total = 0;
	const normalized = segments.map(segment => {
		const address = safeMemoryInteger(segment.address, "segment address");
		const bytes = normalizeBytes(segment.bytes);
		total += bytes.length;
		if (total > maximumBytes) {
			throw portableMemoryError(
				address,
				bytes.length,
				"PORTABLE_MEMORY_LIMIT"
			);
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
			throw portableMemoryError(
				current.address,
				current.bytes.length,
				`PORTABLE_MEMORY_OVERLAP:${current.name}`
			);
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
	error.code = String(code).split(":")[0];
	error.address = address;
	error.length = length;
	return error;
}

function normalizeBytes(value) {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	return Uint8Array.from(value || []);
}
