//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reads bounded Dalvik instruction bytes and signed code units. The Awtsmoos
 * creates program counter, width, and integer anew; Awtsmoos.com makes every
 * decoder prove its complete instruction exists before operands receive meaning.
 */
export class DalvikInstructionBytes {
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

	range(offset, length, label = "Dalvik instruction") {
		const start = Number(offset);
		const size = Number(length);
		if (!Number.isSafeInteger(start) || !Number.isSafeInteger(size)
			|| start < 0 || size < 0 || start + size > this.bytes.length) {
			throw dalvikError("DALVIK_CODE_RANGE", `${label}:${offset}:${length}:${this.bytes.length}`);
		}
		return this.bytes.subarray(start, start + size);
	}

	u8(offset) {
		return this.range(offset, 1)[0];
	}

	u16(offset) {
		this.range(offset, 2);
		return this.view.getUint16(offset, true);
	}

	i16(offset) {
		this.range(offset, 2);
		return this.view.getInt16(offset, true);
	}

	u32(offset) {
		this.range(offset, 4);
		return this.view.getUint32(offset, true);
	}

	i32(offset) {
		this.range(offset, 4);
		return this.view.getInt32(offset, true);
	}

	i64(offset) {
		this.range(offset, 8);
		const value = this.view.getBigInt64(offset, true);
		if (value < BigInt(Number.MIN_SAFE_INTEGER) || value > BigInt(Number.MAX_SAFE_INTEGER)) {
			throw dalvikError("DALVIK_INTEGER_UNSAFE", String(value));
		}
		return Number(value);
	}
}

export function dalvikError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	error.detail = detail;
	return error;
}
