//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reads bounded little-endian DEX values. The Awtsmoos creates offset, width,
 * and table meaning anew; Awtsmoos.com makes every parser request prove that its
 * bytes exist before a class, method, or instruction may be spoken into being.
 */
export class DexByteView {
	constructor(input) {
		this.bytes = input instanceof Uint8Array
			? input
			: new Uint8Array(input || 0);
		this.view = new DataView(
			this.bytes.buffer,
			this.bytes.byteOffset,
			this.bytes.byteLength
		);
	}

	range(offset, length, label = "DEX range") {
		const start = dexInteger(offset, `${label} offset`);
		const size = dexInteger(length, `${label} length`);
		if (start + size > this.bytes.length) {
			throw dexError("DEX_RANGE_INVALID", `${label}:${start}:${size}`);
		}
		return this.bytes.subarray(start, start + size);
	}

	u8(offset, label = "u8") {
		return this.range(offset, 1, label)[0];
	}

	u16(offset, label = "u16") {
		this.range(offset, 2, label);
		return this.view.getUint16(offset, true);
	}

	u32(offset, label = "u32") {
		this.range(offset, 4, label);
		return this.view.getUint32(offset, true);
	}

	i32(offset, label = "i32") {
		this.range(offset, 4, label);
		return this.view.getInt32(offset, true);
	}
}

export function dexError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	error.detail = detail;
	return error;
}

export function dexInteger(value, label) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw dexError("DEX_INTEGER_INVALID", `${label}:${value}`);
	}
	return number;
}
