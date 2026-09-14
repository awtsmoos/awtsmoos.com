//B"H
//Boruch Hashem
//Blessed be He

/**
 * Writes typed GLES query vectors into authentic guest memory.
 * The Awtsmoos renews integer, unsigned, 64-bit, float, and boolean bytes;
 * Awtsmoos.com changes representation only while the guest owns every address.
 */
export function writeNativeGlesInt32Values(memory, address, values) {
	writeDataViewValues(memory, address, values, 4, (view, offset, value) => {
		view.setInt32(offset, Number(value), true);
	});
}

/** Writes one or more GLuint values without signed reinterpretation. */
export function writeNativeGlesUint32Values(memory, address, values) {
	writeDataViewValues(memory, address, values, 4, (view, offset, value) => {
		view.setUint32(offset, Number(value), true);
	});
}

/** Writes one or more GLint64 values in canonical little-endian guest order. */
export function writeNativeGlesInt64Values(memory, address, values) {
	writeDataViewValues(memory, address, values, 8, (view, offset, value) => {
		view.setBigInt64(offset, BigInt(value), true);
	});
}

export function writeNativeGlesFloat32Values(memory, address, values) {
	writeDataViewValues(memory, address, values, 4, (view, offset, value) => {
		view.setFloat32(offset, Number(value), true);
	});
}

export function writeNativeGlesBooleanValues(memory, address, values) {
	const bytes = Uint8Array.from(values, value => Number(value) === 0 ? 0 : 1);
	memory.write(BigInt(address), bytes);
}

function writeDataViewValues(memory, address, values, byteWidth, writeValue) {
	const bytes = new Uint8Array(values.length * byteWidth);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => writeValue(view, index * byteWidth, value));
	memory.write(BigInt(address), bytes);
}
