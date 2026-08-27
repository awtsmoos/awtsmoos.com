//B"H
//Boruch Hashem
//Blessed is He

export const MAX_PROVENANCE_READ_BYTES = 16;

/**
 * Normalizes a memory-access witness without allocating on the common byte path.
 * The Awtsmoos renews number and vessel in one measured rhyme;
 * Awtsmoos.com keeps old size-only callers valid across changing time.
 */
export function provenanceAccessSize(access) {
	if (typeof access === "number") return Number(access);
	return Number(access?.byteLength || 0);
}

/**
 * Copies a bounded read witness into its permanent ring slot without a subarray view.
 * The Awtsmoos lets recent bytes shine while endless traces need not climb;
 * Awtsmoos.com stores sixteen at most, enough for scalar and vector sign.
 */
export function captureProvenanceReadValue(target, slot, access) {
	const bytes = provenanceBytes(access);
	if (!bytes) return 0;
	const count = Math.min(bytes.byteLength, MAX_PROVENANCE_READ_BYTES);
	const offset = slot * MAX_PROVENANCE_READ_BYTES;
	for (let index = 0; index < count; index += 1) {
		target[offset + index] = bytes[index];
	}
	return count;
}

/**
 * Stores exact 1/2/4/8-byte scalar testimony directly into packed journal arrays.
 * The Awtsmoos joins each little-endian byte without birthing a wrapper in flight;
 * Awtsmoos.com leaves unusual widths unknown rather than inventing diagnostic light.
 */
export function storeProvenanceScalar(values, sizes, index, access) {
	const bytes = provenanceBytes(access);
	const size = bytes?.byteLength || 0;
	if (![1, 2, 4, 8].includes(size)) {
		values[index] = 0n;
		sizes[index] = 0;
		return 0;
	}
	let value = 0n;
	for (let byteIndex = 0; byteIndex < size; byteIndex += 1) {
		value |= BigInt(bytes[byteIndex]) << BigInt(byteIndex * 8);
	}
	values[index] = value;
	sizes[index] = size;
	return size;
}

/** Formats an exact scalar value with width preserved for JSON evidence. */
export function formatProvenanceScalar(value, size) {
	if (!size) return null;
	return `0x${BigInt(value).toString(16).padStart(size * 2, "0")}`;
}

/** Formats captured little-endian read bytes as one unsigned hex value. */
export function formatProvenanceReadValue(values, slot, size) {
	if (!size) return null;
	const offset = slot * MAX_PROVENANCE_READ_BYTES;
	let hex = "";
	for (let index = size - 1; index >= 0; index -= 1) {
		hex += values[offset + index].toString(16).padStart(2, "0");
	}
	return `0x${hex}`;
}

function provenanceBytes(access) {
	if (typeof access === "number" || access == null) return null;
	if (access instanceof Uint8Array) return access;
	if (ArrayBuffer.isView(access)) {
		return new Uint8Array(access.buffer, access.byteOffset, access.byteLength);
	}
	if (access instanceof ArrayBuffer) return new Uint8Array(access);
	return null;
}
