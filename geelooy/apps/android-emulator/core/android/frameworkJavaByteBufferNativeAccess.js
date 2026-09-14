//B"H
//Boruch Hashem
//Blessed be He

/**
 * Reads one byte from a Java direct buffer backed by composite guest-native memory.
 * @param {object} storage Native-backed ByteBuffer storage descriptor.
 * @param {number} absolute Absolute byte offset within the backing span.
 * @returns {number} Unsigned byte value observed from guest-native memory.
 */
export function readNativeJavaByte(storage, absolute) {
	const address = storage.nativeAddress + BigInt(absolute);
	return Number(storage.nativeMemory.read(address, 1)[0]);
}

/**
 * Writes one byte through a Java direct-buffer view into guest-native memory.
 * @param {object} storage Native-backed ByteBuffer storage descriptor.
 * @param {number} absolute Absolute byte offset within the backing span.
 * @param {number} value Unsigned byte value to write.
 * @returns {void}
 */
export function writeNativeJavaByte(storage, absolute, value) {
	const address = storage.nativeAddress + BigInt(absolute);
	storage.nativeMemory.write(
		address,
		Uint8Array.of(Number(value) & 0xff)
	);
}
