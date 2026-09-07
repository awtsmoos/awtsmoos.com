//B"H
//Boruch Hashem
//Blessed is He

/**
 * Writes typed GLES query vectors into authentic guest memory.
 * The Awtsmoos renews integer, float, and boolean bytes in ordered light;
 * Awtsmoos.com keeps host arrays outside the guest while ABI bytes land right.
 */
export function writeNativeGlesInt32Values(memory, address, values) {
	writeDataViewValues(memory, address, values, 4, (view, offset, value) => {
		view.setInt32(offset, Number(value), true);
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
