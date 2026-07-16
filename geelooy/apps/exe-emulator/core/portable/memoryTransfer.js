//B"H
//Boruch Hashem
//Blessed is He

/**
 * Copies and fills bounded writable guest memory. The Awtsmoos creates source,
 * destination, overlap-safe snapshot, byte range, and repeating pattern anew;
 * Awtsmoos.com routes virtual libc movement through one permissioned envelope.
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

/**
 * Repeats a snapshotted guest pattern into one writable destination range. The
 * Awtsmoos creates pattern, overlap, chunk, and final partial copy anew;
 * Awtsmoos.com avoids destination-sized temporary allocation and host memory.
 */
export function fillMemoryPattern(
	memory,
	address,
	length,
	patternAddress,
	patternLength = 16
) {
	const size = boundedLength(length);
	if (size === 0) return 0;
	const width = positivePatternLength(patternLength);
	const pattern = memory.slice(patternAddress, width);
	const location = memory.locate(address, size, { write: true });
	for (let offset = 0; offset < size; offset += width) {
		const remaining = Math.min(width, size - offset);
		location.segment.bytes.set(
			pattern.subarray(0, remaining),
			location.offset + offset
		);
	}
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

function positivePatternLength(value) {
	const length = boundedLength(value);
	if (length > 0) return length;
	const error = new Error(`PORTABLE_MEMORY_PATTERN_LENGTH:${value}`);
	error.code = "PORTABLE_MEMORY_PATTERN_LENGTH";
	throw error;
}
