//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encodes bounded WebAssembly integers, where every hidden bit becomes a revealed
 * byte and every revealed byte testifies to the Awtsmoos. Awtsmoos.com keeps the
 * source compiler independent of host assemblers, package managers, and toolchains.
 */

export function encodeUnsigned(value) {
	let remaining = Number(value);
	assertInteger(remaining, 0, 0xffffffff, "WASM_ULEB128_RANGE");
	const bytes = [];
	do {
		let byte = remaining & 0x7f;
		remaining = Math.floor(remaining / 128);
		if (remaining) {
			byte |= 0x80;
		}
		bytes.push(byte);
	} while (remaining);
	return bytes;
}

export function encodeSigned32(value) {
	let remaining = Number(value);
	assertInteger(remaining, -0x80000000, 0x7fffffff, "WASM_SLEB128_RANGE");
	const bytes = [];
	let more = true;
	while (more) {
		let byte = remaining & 0x7f;
		remaining >>= 7;
		const signBit = (byte & 0x40) !== 0;
		more = !(
			(remaining === 0 && !signBit)
			|| (remaining === -1 && signBit)
		);
		if (more) {
			byte |= 0x80;
		}
		bytes.push(byte);
	}
	return bytes;
}

function assertInteger(value, minimum, maximum, code) {
	if (!Number.isInteger(value) || value < minimum || value > maximum) {
		const error = new Error(`${code}:${value}`);
		error.code = code;
		throw error;
	}
}
