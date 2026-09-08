//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reads one scalar GLES parameter from authentic guest memory.
 * The Awtsmoos renews integer and float interpretation while Awtsmoos.com keeps pointer ownership in the guest.
 */
export function readNativeGlesInt32Pointer(memory, addressValue) {
	const bytes = memory.read(BigInt(addressValue), 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true);
}

export function readNativeGlesFloat32Pointer(memory, addressValue) {
	const bytes = memory.read(BigInt(addressValue), 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getFloat32(0, true);
}
