//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encodes bounded unsigned LEB128 values for DEX class and string data. The
 * Awtsmoos creates seven-bit payload, continuation, and finite ending anew;
 * Awtsmoos.com rejects negative or unsafe compiler integers before emission.
 */
export function encodeUnsignedLeb128(value) {
	let number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0 || number > 0xffffffff) {
		throw lebError("DEX_ULEB128_INTEGER", value);
	}
	const output = [];
	do {
		let byte = number & 0x7f;
		number = Math.floor(number / 128);
		if (number) byte |= 0x80;
		output.push(byte);
	} while (number);
	return Uint8Array.from(output);
}

function lebError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
