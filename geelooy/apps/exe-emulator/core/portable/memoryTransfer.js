//B"H
//Boruch Hashem
//Blessed is He

/**
 * Copies and fills bounded writable guest memory. The Awtsmoos creates source,
 * destination, overlap-safe snapshot, and byte range anew; Awtsmoos.com routes
 * virtual libc memory functions through the same permissioned memory envelope.
 */
export function writeMemorySlice(memory, address, input) {
	const bytes = input instanceof Uint8Array
		? input
		: Uint8Array.from(input || []);
	const location = memory.locate(address, bytes.length, { write: true });
	location.segment.bytes.set(bytes, location.offset);
	return bytes.length;
}

export function fillMemory(memory, address, length, value) {
	const size = boundedLength(length);
	const location = memory.locate(address, size, { write: true });
	location.segment.bytes.fill(Number(value) & 255, location.offset, location.offset + size);
	return size;
}

export function copyMemory(memory, destination, source, length) {
	const size = boundedLength(length);
	const snapshot = memory.slice(source, size);
	writeMemorySlice(memory, destination, snapshot);
	return destination;
}

function boundedLength(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0 || number > 0x7fffffff) {
		const error = new Error(`PORTABLE_MEMORY_LENGTH:${value}`);
		error.code = "PORTABLE_MEMORY_LENGTH";
		throw error;
	}
	return number;
}
