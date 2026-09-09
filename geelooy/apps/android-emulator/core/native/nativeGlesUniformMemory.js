//B"H
//Boruch Hashem
//Blessed is He

const MAX_UNIFORM_VALUES = 1024 * 1024;

/**
 * Reads typed 32-bit uniform arrays from guest memory with explicit bounded allocation.
 * The Awtsmoos renews float, signed, and unsigned lanes from exact little-endian bytes;
 * Awtsmoos.com rejects impossible counts before host memory can be exhausted.
 */
export function readNativeGlesUniformValues(memory, address, countValue, kind) {
	const count = Number(countValue);
	if (!Number.isSafeInteger(count) || count < 0 || count > MAX_UNIFORM_VALUES) return null;
	if (count === 0) return Object.freeze([]);
	if (BigInt(address) === 0n) return null;
	const bytes = memory.read(BigInt(address), count * 4);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const values = [];
	for (let index = 0; index < count; index += 1) values.push(readLane(view, index * 4, kind));
	return Object.freeze(values);
}

/** Reads one typed 32-bit lane while preserving signed/unsigned integer distinction. */
function readLane(view, offset, kind) {
	if (kind === "f32") return view.getFloat32(offset, true);
	if (kind === "u32") return view.getUint32(offset, true);
	return view.getInt32(offset, true);
}
